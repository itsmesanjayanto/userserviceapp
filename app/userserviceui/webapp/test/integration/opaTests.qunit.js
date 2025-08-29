sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'userserviceui/test/integration/FirstJourney',
		'userserviceui/test/integration/pages/UserGroupsList',
		'userserviceui/test/integration/pages/UserGroupsObjectPage'
    ],
    function(JourneyRunner, opaJourney, UserGroupsList, UserGroupsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('userserviceui') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheUserGroupsList: UserGroupsList,
					onTheUserGroupsObjectPage: UserGroupsObjectPage
                }
            },
            opaJourney.run
        );
    }
);