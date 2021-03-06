Ext.define("Compass.ErpApp.Shared.Crm.UsersGrid", {
    extend: "Ext.grid.Panel",
    alias: 'widget.crmusersgrid',
    frame: false,
    autoScroll: true,
    loadMask: true,

    /**
     * @cfg {String} addBtnIconCls
     * Icon css class for add button.
     */
    addBtnIconCls: 'icon-add',

    /**
     * @cfg {String} addBtnDescription
     * Description for add party button.
     */
    addBtnDescription: 'Add Customer',

    /**
     * @cfg {String} title
     * title of panel.
     */
    title: 'Users',

    /**
     * @cfg {Array | Object} includedToPartyRelationships
     * Party Relationships to include as a column in this grid. It has to be a one to one relationships
     *
     * @param {String} title
     * title of column
     *
     * @param {String} relationshipType
     * relationship type internal_identifier
     *
     * @param {String} toRoleType
     * RoleType internal_identifier for to side
     *
     * @example
     * {
            title: 'Business',
            relationshipType: 'employee_business',
            toRoleType: 'business'
        }
     */
    includedToPartyRelationships: [],

    /**
     * @cfg {String} partyRole
     * Get all user records with this partyRole.
     */
    partyRole: 'customer',

    /**
     * @cfg {String} toRole
     * To RoleType these parties should be related to.
     */
    toRole: null,

    /**
     * @cfg {Integer} toPartyId
     * To parties id to get related parties from.
     */
    toPartyId: null,

    /**
     * @cfg {String} searchDescription
     * Placeholder description for user search box.
     */
    searchDescription: 'Find User',

    /**
     * @cfg {Boolean} canAddUser
     * True to allow users to add users.
     */
    canAddUser: true,

    /**
     * @cfg {Boolean} canEditUser
     * True to allow users to be edited.
     */
    canEditUser: true,

    /**
     * @cfg {Boolean} canDeleteUser
     * True to allow user deletion.
     */
    canDeleteUser: true,

    constructor: function (config) {
        var listeners = {
            activate: function () {
                this.store.load();
            }
        };

        config['listeners'] = Ext.apply(listeners, config['listeners']);

        this.callParent([config]);
    },

    initComponent: function () {
        var me = this;

        me.addEvents(
            /*
             * @event adduserclick
             * Fires when add user is clicked.  Return false to cancel.
             * @param {Compass.ErpApp.Shared.Crm.UsersGrid} this
             */
            'adduserclick',
            /*
             * @event edituserclick
             * Fires before edit user is clicked. Return false to cancel
             * @param {Compass.ErpApp.Shared.Crm.UsersGrid} this
             * @param {Compass.ErpApp.Shared.Crm.User} user about to be edited
             */
            'edituserclick'
        );

        var userFields = [
            'id',
            'username',
            {name: 'firstName', mapping: 'first_name'},
            {name: 'lastName', mapping: 'last_name'},
            {name: 'partyDescription', mapping: 'party_description'},
            'email',
            {name: 'status', mapping: 'activation_state'},
            {name: 'lastLoginAt', mapping: 'last_login_at', type: 'date'},
            {name: 'createdAt', mapping: 'created_at', type: 'date'},
            {name: 'updatedAt', mapping: 'updated_at', type: 'date'}
        ];

        if (!Ext.isEmpty(me.includedToPartyRelationships)) {
            Ext.each(me.includedToPartyRelationships, function (relationship) {
                userFields.push({
                    name: relationship.toRoleType
                })
            });
        }

        this.store = Ext.create('Ext.data.Store', {
            autoLoad: false,
            autoSync: true,
            proxy: {
                type: 'ajax',
                url: '/erp_app/organizer/crm/users',
                extraParams: {
                    party_role: me.partyRole,
                    to_role: me.toRole,
                    to_party_id: me.toPartyId,
                    included_party_to_relationships: Ext.encode(me.includedToPartyRelationships)
                },
                reader: {
                    type: 'json',
                    successProperty: 'success',
                    idProperty: 'id',
                    root: 'users',
                    totalProperty: 'total',
                    messageProperty: 'message'
                }
            },
            fields: userFields
        });

        // setup toolbar
        var toolBarItems = [];

        // attempt to add Add party button
        if (me.canAddUser) {
            toolBarItems.push({
                text: me.addBtnDescription,
                xtype: 'button',
                iconCls: me.addBtnIconCls,
                handler: function (button) {
                    if (me.fireEvent('adduserclick', me) !== false) {

                    }
                }
            }, '|');
        }

        toolBarItems.push('Search',
            {
                xtype: 'textfield',
                emptyText: me.searchDescription,
                width: 200,
                listeners: {
                    specialkey: function (field, e) {
                        if (e.getKey() == e.ENTER) {
                            var button = field.up('toolbar').down('button');
                            button.fireEvent('click', button);
                        }
                    }
                }
            },
            {
                xtype: 'button',
                itemId: 'searchbutton',
                icon: '/images/erp_app/organizer/applications/crm/toolbar_find.png',
                listeners: {
                    click: function (button, e, eOpts) {
                        var grid = button.up('crmusersgrid'),
                            value = grid.down('toolbar').down('textfield').getValue();

                        grid.store.load({
                            params: {
                                query_filter: value,
                                start: 0,
                                limit: 25
                            }
                        });
                    }
                }
            });

        this.dockedItems = [
            {
                xtype: 'toolbar',
                docked: 'top',
                items: toolBarItems
            },
            {
                xtype: 'pagingtoolbar',
                store: this.store,
                dock: 'bottom',
                displayInfo: true
            }
        ];

        // setup columns

        var columns = [];

        if (!Ext.isEmpty(me.includedToPartyRelationships)) {
            Ext.each(me.includedToPartyRelationships, function (relationship) {
                columns.push({
                    header: relationship.title,
                    dataIndex: relationship.toRoleType,
                    width: 150
                })
            });
        }

        columns.push(
            {
                header: 'Username',
                dataIndex: 'username',
                width: 150
            },
            {
                header: 'Full Name',
                dataIndex: 'partyDescription',
                width: 200
            },
            {
                header: 'Email',
                dataIndex: 'email',
                width: 200
            },
            {
                header: 'Status',
                dataIndex: 'status',
                renderer: 'capitalize'
            },
            {
                header: 'Last Login',
                width: 150,
                dataIndex: 'lastLoginAt',
                renderer: Ext.util.Format.dateRenderer('m/d/Y H:i:s')
            },
            {
                header: 'Created At',
                width: 150,
                dataIndex: 'createdAt',
                renderer: Ext.util.Format.dateRenderer('m/d/Y H:i:s')
            },
            {
                header: 'Updated At',
                width: 150,
                dataIndex: 'updatedAt',
                renderer: Ext.util.Format.dateRenderer('m/d/Y H:i:s')
            }
        );

        // attempt to add edit column
        if (me.canEditUser) {
            columns.push({
                xtype: 'actioncolumn',
                header: 'Edit',
                align: 'center',
                width: 50,
                items: [
                    {
                        icon: '/images/icons/edit/edit_16x16.png',
                        tooltip: 'Edit',
                        handler: function (grid, rowIndex, colIndex) {
                            var record = grid.getStore().getAt(rowIndex);

                            if (me.fireEvent('edituserclick', me, record) !== false) {

                            }
                        }
                    }
                ]
            });

        }

        // attempt to add delete column
        if (me.canDeleteUser) {
            columns.push({
                xtype: 'actioncolumn',
                header: 'Delete',
                align: 'center',
                width: 50,
                items: [
                    {
                        icon: '/images/icons/delete/delete_16x16.png',
                        tooltip: 'Delete',
                        handler: function (grid, rowIndex, colIndex) {
                            var record = grid.getStore().getAt(rowIndex);

                            var myMask = new Ext.LoadMask(grid, {msg: "Please wait..."});
                            myMask.show();

                            Ext.Msg.confirm('Please Confirm', 'Delete record?', function (btn) {
                                if (btn == 'ok' || btn == 'yes') {
                                    Ext.Ajax.request({
                                        method: 'DELETE',
                                        url: '/erp_app/organizer/crm/users/' + record.get('id'),
                                        success: function (response) {
                                            myMask.hide();
                                            responseObj = Ext.JSON.decode(response.responseText);

                                            if (responseObj.success) {
                                                grid.store.reload();
                                            }
                                        },
                                        failure: function (response) {
                                            myMask.hide();
                                            Ext.Msg.alert("Error", "Error with request.");
                                        }
                                    });
                                }
                                else {
                                    myMask.hide();
                                }
                            });
                        }
                    }
                ]
            });
        }

        this.columns = columns;

        this.callParent();
    }
});


