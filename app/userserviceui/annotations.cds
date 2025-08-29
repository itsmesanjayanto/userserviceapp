using UserService as service from '../../srv/UserService';

annotate service.UserGroups with @(

    UI.HeaderInfo : {
        $Type          : 'UI.HeaderInfoType',
        TypeName       : 'Role',
        TypeNamePlural : 'Roles',
    },


    UI.LineItem   : [
        {
            $Type             : 'UI.DataField',
            Value             : value,
            Label             : 'Role ID',
            ![@UI.Importance] : #High,
        },

        {
            $Type             : 'UI.DataField',
            Value             : description,
            Label             : 'Description',
            ![@UI.Importance] : #High,
        },
        {
            $Type             : 'UI.DataField',
            Value             : systemName,
            Label             : 'System Name',
            ![@UI.Importance] : #High,
        },

        {
            $Type              : 'UI.DataFieldForAction',
            Label              : 'Delete',
            Action             : 'UserService.unassignGroups',
            InvocationGrouping : #ChangeSet
        }
    ]
);
