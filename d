_schema-version: "3.1"
ID: usermanage
description: A simple CAP project.
version: 1.0.0
modules:
  - name: usermanage-srv
    type: nodejs
    path: gen/srv
    requires:
      - name: usermanage-uaa
      - name: usermanage-destination-service
    provides:
      - name: srv-api
        properties:
          srv-url: ${default-url}
    parameters:
      buildpack: nodejs_buildpack
    build-parameters:
      builder: npm-ci
  - name: usermanage-app-content
    type: com.sap.application.content
    path: .
    requires:
      - name: usermanage-repo-host
        parameters:
          content-target: true
    build-parameters:
      build-result: resources
      requires:
        - artifacts:
            - userserviceui.zip
          name: userserviceui
          target-path: resources/
  - name: userserviceui
    type: html5
    path: app/userserviceui
    build-parameters:
      build-result: dist
      builder: custom
      commands:
        - npm install
        - npm run build:cf
      supported-platforms: []
  - name: usermanage-destination-content
    type: com.sap.application.content
    requires:
      - name: usermanage-destination-service
        parameters:
          content-target: true
      - name: usermanage-repo-host
        parameters:
          service-key:
            name: usermanage-repo-host-key
      - name: usermanage-uaa
        parameters:
          service-key:
            name: usermanage-uaa-key
    parameters:
      content:
        instance:
          destinations:
            - Name: sde_usermanage_repo_host
              ServiceInstanceName: usermanage-html5-srv
              ServiceKeyName: usermanage-repo-host-key
              sap.cloud.service: sde
            - Authentication: OAuth2UserTokenExchange
              Name: sde_usermanage_auth
              ServiceInstanceName: usermanage-uaa
              ServiceKeyName: usermanage-uaa-key
              sap.cloud.service: sde
          existing_destinations_policy: ignore
    build-parameters:
      no-source: true
resources:
  - name: usermanage-uaa
    type: org.cloudfoundry.managed-service
    parameters:
      config:
        tenant-mode: dedicated
        xsappname: usermanage-${space}
      path: ./xs-security.json
      service: xsuaa
      service-plan: application
  - name: usermanage-repo-host
    type: org.cloudfoundry.managed-service
    parameters:
      service: html5-apps-repo
      service-name: usermanage-html5-srv
      service-plan: app-host
  - name: usermanage-destination-service
    type: org.cloudfoundry.managed-service
    parameters:
      config:
        HTML5Runtime_enabled: true
        init_data:
          instance:
            destinations:
              - Authentication: NoAuthentication
                Name: ui5
                ProxyType: Internet
                Type: HTTP
                URL: https://ui5.sap.com
              - Authentication: NoAuthentication
                HTML5.DynamicDestination: true
                HTML5.ForwardAuthToken: true
                Name: srv-api
                ProxyType: Internet
                Type: HTTP
                URL: https://${appname}.${default-domain}
            existing_destinations_policy: update
        version: 1.0.0
      service: destination
      service-name: usermanage-destination-service
      service-plan: lite
parameters:
  appname: se-demo-solswzgla24-wz-tool-role-poc-usermanage-srv
  deploy_mode: html5-repo
  enable-parallel-deployments: true
build-parameters:
  before-all:
    - builder: custom
      commands:
        - npx -p @sap/cds-dk cds build --production
