const { buildRequestWithMergedHeadersAndQueryParameters } = require('@sap-cloud-sdk/http-client/dist/http-client');
const cds = require('@sap/cds');
const jwtDecode = require('jwt-decode');


module.exports = cds.service.impl(async function () {

    const bupa = await cds.connect.to('User.Management._System.for.Cross.domain.Identity.Management._SCIM__');
    // const { Systems } = cds.entities;
    const Systems = await cds.connect.to('citwzdb');
    // const UserService = await cds.connect.to('UserService');

    const fGetUserGroups = async (userID, IASOrigin) => {
        const data = await bupa.send({
            method: "GET", path: "Users?filter=origin eq '" + IASOrigin + "' and id eq '" + userID + "'"
        })
        let aData = [];
        aData = data.resources[0].groups;

        let mData = [];
        for (var i = 0; i < aData.length; i++) {
            if (aData[i].value.startsWith("~")) {

                const oGroupData = await bupa.send({
                    method: "GET", path: 'Groups/' + aData[i].value
                })
                aData[i].description = oGroupData.description;
                mData.push(aData[i]);
            }
        }
        return mData;
    }

    const fnGetGroup = async (req) => {
        var decodedJWTToken = jwtDecode(req.headers.authorization.substring(7));
        var vsubAccount = decodedJWTToken.ext_attr.zdn;

        const groupData = await bupa.send({
            method: "GET", path: 'Groups/' + req.data.id
        });
        if (groupData) {
            var vRoleSub = groupData.id.substring(0, groupData.id.indexOf("_"));
            // let system = await SELECT.one.from(Systems).columns("name").where({ ID: vRoleSub });
            let system = await Systems.run(SELECT.one.from('systemsinfo').columns("name").where({ ID: vRoleSub, subAccount: vsubAccount }));
            if (system.value && system.value.length !== 0) {
                data.resources[i].systemName = system.value[0].name;
            }
        }
        return groupData;
    };

    const fnGetGroups = async (req) => {
        var vSearch, vSystemName;
        var decodedJWTToken = jwtDecode(req.headers.authorization.substring(7));
        var vsubAccount = decodedJWTToken.ext_attr.zdn;


        var aSystem = [];
        if (Array.isArray(req.query.SELECT.search) && req.query.SELECT.search.length !== 0) {

            vSearch = new RegExp(req.query.SELECT.search[0].val, "i");
        }

        if (req.query.SELECT.where) {
            if (Array.isArray(req.query.SELECT.where) && req.query.SELECT.where[0].args && req.query.SELECT.where[0].args.length !== 0) //Only one selcted item
                aSystem.push(req.query.SELECT.where[0].args[1].val);
            if (Array.isArray(req.query.SELECT.where) && req.query.SELECT.where[0].xpr) { //Multiple items
                var aXpr = req.query.SELECT.where[0].xpr;
                aXpr.forEach(function (oXpr) {
                    if (oXpr.args) {
                        aSystem.push(oXpr.args[1].val);
                    }
                })
            }
        }



        const aData = [];
        const data = await bupa.send({
            method: "GET", path: 'Groups?count=500'
        })

        let system = await Systems.run(SELECT.from('systemsinfo').columns("name").where({ subAccount: vsubAccount }));

        for (var i = 0; i < data.resources.length; i++) {
            if (data.resources[i].id.startsWith("~")) {
                if (vSearch && data.resources[i].id.search(vSearch) === -1 && data.resources[i].description.search(vSearch) === -1) {
                    continue;
                }
                var vRoleSub = data.resources[i].id.substring(0, data.resources[i].id.indexOf("_"));
                // let system = await SELECT.one.from(Systems).columns("name").where({ ID: vRoleSub  });

                var vIndex = system.value.findIndex(
                    value => {
                        return value.ID === vRoleSub
                    }
                );
                if (system.value && system.value.length !== 0 && vIndex !== -1) {
                    data.resources[i].systemName = system.value[vIndex].name;
                }
                if (aSystem.length !== 0 && aSystem.indexOf(vRoleSub) === -1) {
                    continue;
                }
                aData.push(data.resources[i]);
            }
        }

        aData.$count = aData.length;
        return aData;
    };

    this.on('READ', 'Users', async req => {
        console.log('User info');
        var decodedJWTToken = jwtDecode(req.headers.authorization.substring(7));
        console.log(decodedJWTToken);
        const aData = [];
        // const data = await bupa.run(SELECT.from('User.Management._System.for.Cross.domain.Identity.Management._SCIM__.Users'));
        const data = await bupa.send({
            method: "GET", path: "Users?filter=origin eq '" + decodedJWTToken.origin + "'"
        })
        for (var i = 0; i < data.resources.length; i++) {
            aData.push({ id: data.resources[i].id, externalId: data.resources[i].externalId, userName: data.resources[i].userName, groups: data.resources[i].groups });
        }
        return aData;
        // console.log(data);
    });


    this.on('READ', 'Systems', async req => {
        var decodedJWTToken = jwtDecode(req.headers.authorization.substring(7));
        var vsubAccount = decodedJWTToken.ext_attr.zdn;
        let systems = await Systems.run(SELECT.from('systemsinfo').columns('name').where({ subAccount: vsubAccount }));
        // var aData = []  ;
        // for (let index = 0; index < systems.value.length; index++) {
        //     aData[index].name = systems.value[index].name; 
        //     systems.value.push(aData[index]);
        // }  
        return systems.value;
    });

    this.on('READ', 'Groups', async req => {

        try {
            if (req.data.id) {
                return await fnGetGroup(req);
            } else {
                return await fnGetGroups(req);
            }
        } catch (error) {

        }
        // console.log(data);
    });

    this.on('READ', 'UserGroups', async req => {
        var decodedJWTToken = jwtDecode(req.headers.authorization.substring(7));
        var vsubAccount = decodedJWTToken.ext_attr.zdn;


        var vFilter = "origin eq '" + decodedJWTToken.origin + "' and id eq '" + decodedJWTToken.user_id + "'";

        var vSearch;

        if (Array.isArray(req.query.SELECT.search) && req.query.SELECT.search.length !== 0) {

            vSearch = new RegExp(req.query.SELECT.search[0].val, "i");
        }

        const data = await bupa.send({
            method: "GET", path: "Users?filter=" + vFilter
        })

        console.log(data);

        let aData = [];
        aData = data.resources[0].groups;

        // let mData = JSON.parse(JSON.stringify(aData));
        let mData = [];
        var system = await Systems.run(SELECT.from('systemsinfo').columns("name").where({ subAccount: vsubAccount }));
        const oGroupData = await bupa.send({
            method: "GET", path: 'Groups?count=500' //+ aData[i].value
        })
        for (var i = 0; i < aData.length; i++) {
            if (aData[i].value.startsWith("~")) {

                var vIndexG = oGroupData.resources.findIndex(
                    value => {
                        return value.id === aData[i].value
                    }
                );
                // aData[i].description = oGroupData.description;
                if (oGroupData.resources && oGroupData.resources.length !== 0 && vIndexG !== -1) {
                    aData[i].description = oGroupData.resources[vIndexG].description;
                }


                // let system = await SELECT.from(Systems).columns("name").where({ ID: vRoleSub , subAccount: vsubAccount });
                var vRoleSub = aData[i].value.substring(0, aData[i].value.indexOf("_"));

                var vIndex = system.value.findIndex(
                    value => {
                        return value.ID === vRoleSub
                    }
                );

                if (system.value && system.value.length !== 0 && vIndex !== -1) {
                    aData[i].systemName = system.value[vIndex].name;
                }

                if (vSearch && aData[i].value.search(vSearch) === -1 && aData[i].description.search(vSearch) === -1) {
                    continue;
                }
                mData.push(aData[i]);
            }
        }
        mData.$count = mData.length;
        return mData;
    });

    this.on('assignRoles', async req => {
        console.log(bupa.entities());
        var decodedJWTToken = jwtDecode(req.headers.authorization.substring(7));
        const aRoles = req.data.Id;

        let aStatus = [];
        for (var i = 0; i < aRoles.length; i++) {
            try {
                const data = await bupa.send({
                    method: "POST",
                    path: 'Groups/' + aRoles[i] + '/members',
                    data: {
                        "origin": decodedJWTToken.origin,
                        "type": "USER",
                        "value": decodedJWTToken.user_id
                    },
                    headers: { "If-Match": "1" }
                });
                aStatus.push({ type: 'Success', message: 'Role ' + aRoles[i] + " has been assigned successfully" });
            }
            catch (error) {
                aStatus.push({ type: 'Error', message: error.reason.response.body.message });
            }
        }
        return aStatus;
    });

    //Unassign Groups from Users
    this.on('unassignGroups', async req => {

        var decodedJWTToken = jwtDecode(req.headers.authorization.substring(7));
        let vRole = req.params[0].value;

        const data = await bupa.send({
            method: "GET", path: "Groups/" + vRole + ""
        });
        let aMembers = [];
        aMembers = data.members;

        for (var i = 0; i < aMembers.length; i++) {
            // aData.push({ id: data.resources[i].id, externalId: data.resources[i].externalId, userName: data.resources[i].userName,groups:data.resources[i].groups });
            if (aMembers[i].value === decodedJWTToken.user_id) {
                aMembers.splice(i, 1)
                console.log(aMembers)
            } else {

            }
        }

        const postData = await bupa.send({
            method: "PUT", path: "Groups/" + vRole + "", data: data, headers: { "If-Match": "1" }
        })

        // const UserGroups = await cds.entities['UserService.UserGroups'];
        // const aUserGroups = await SELECT.from(UserGroups);


        req.notify({
            code: 200,
            message: 'Roles unassigned successfully :' + vRole
        })

        // const UserGroups = await fGetUserGroups(decodedJWTToken.user_id, decodedJWTToken.origin)
        return [];

    });

    this.on('UsersFn', async req => {
        console.log(req);
        return bupa.run(SELECT.from('User.Management._System.for.Cross.domain.Identity.Management._SCIM__.Users'));
    });

    this.on('GroupsFn', async req => {
        console.log(req);
        return bupa.run(SELECT.from('User.Management._System.for.Cross.domain.Identity.Management._SCIM__.Groups'));
    });


});
