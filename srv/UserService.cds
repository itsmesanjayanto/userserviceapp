using User.Management._System.for.Cross.domain.Identity.Management._SCIM__ as scim from './external/PlatformAPI.csn';
using User.Management._System.for.Cross.domain.Identity.Management._SCIM___types as types from './external/PlatformAPI.csn';
// using  { cit.user.manageauth as um } from '../db/schema';
using { citwzdb as um } from './external/citwzdb.csn';

@path : '/user/'
@(requires : 'authenticated-user')
service UserService {
    // @readonly
    // entity Users {
    //     key id         : String;
    //         externalId : String;
    //         userName   : String;
    //         groups     : array of types.Group;
    // };

    entity Systems as projection on um.systemsinfo;
    @readonly
    @cds.odata.valuelist
    @cds.persistence.skip
    entity Groups {
        key id          : String;
            meta        : types.ScimMeta;
            displayName : String;
            zoneId      : String;
            description : String;
            members     : array of types.ScimGroupMember;
            schemas     : array of String;
            systemName  : String;
            subAccount: String
    };

    @readonly
    @cds.persistence.skip
    entity UserGroups {
        key value       : String;
            systemName: String;
            subAccount: String;
            display     : String;
            type        : String;
            description : String
    } actions {
        @cds.odata.bindingparameter.name : '_it'
        @Common.SideEffects              : {TargetEntities : ['/UserService.EntityContainer/UserGroups'], }
        action unassignGroups() returns UserGroups;
    };

    action   assignRoles(Id : array of String @(
        title            : 'Role name',
        Common.ValueList : {
            Label          : 'Roles',
            CollectionPath : 'Groups',
            Parameters     : [
                {
                    $Type             : 'Common.ValueListParameterInOut',
                    ValueListProperty : 'id',
                    LocalDataProperty : Id
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'displayName'
                },
                  {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'systemName'
                }
            ]
        }
    )
    )                                                               returns array of {
        type : String;
        message : String
    };

    function UsersFn()                                              returns types.ScimUsers;
    function GroupsFn()                                             returns types.ScimGroups;
    action   updateGroups(Id : String, body : types.ScimGroupPatch) returns types.ScimGroupPatch;

}
