Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            itemId: 'parentPanel',
            componentCls: 'panel',
            items: [
                {
                xtype: 'panel',
                title: 'Portfolio Items updated in the last 30 days',
                width: 600,
                itemId: 'childPanel1'
                },
                {
                xtype: 'panel',
                width: 600,
                itemId: 'childPanel2'
                }
            ]
        });
        this.add(panel);
	    this.down('#childPanel2').add({
		id: 'cp2',
		padding: 10,
		width: 600,
	        height: 400,
		overflowX: 'auto',
		overflowY: 'auto',
		html: 'No artifact is selected'
	    });
        var startDate = new Date(new Date() - 86400000*30).toISOString(); //in the last 30 days; millisecondsInDay = 86400000
        
        var filters = [
            {
                property : 'LastUpdateDate',
                operator : '>=',
                value : startDate
            }	
   	];
        var artifacts = Ext.create('Rally.data.wsapi.artifact.Store', {
            models: ['PortfolioItem/Theme','PortfolioItem/Initiative', 'PortfolioItem/Feature'],
            fetch: ['FormattedID','Name','State','Notes'],
            autoLoad: true,
            filters : filters,
            listeners: {
		    load: this._onDataLoaded,
		    scope: this
                 }
        });
    },
    	_onDataLoaded: function(store, data) {
            this._customRecords = [];
            _.each(data, function(artifact, index) {
                this._customRecords.push({
                    _ref: artifact.get('_ref'),
                    FormattedID: artifact.get('FormattedID'),
                    Name: artifact.get('Name'),
                    State: artifact.get('State'),
                    Notes: artifact.get('Notes')
                });
            }, this);
       this._createGrid(store,data);
    },

        _createGrid: function(store,data){
            var that = this;
            var g = Ext.create('Rally.ui.grid.Grid', {
                itemId: 'g',
   		store: store,
                enableEditing: false,
                showRowActionsColumn: false,
                columnCfgs: [
                    {text: 'Formatted ID', dataIndex: 'FormattedID'},
                    {text: 'Name', dataIndex: 'Name'},
                    {text: 'State', dataIndex: 'State'},
                    {text: 'Notes',
                         renderer: function (v, m, r) {
                            var id = Ext.id();
                            Ext.defer(function () {
                                Ext.widget('button', {
                                    renderTo: id,
                                    text: 'see Notes',
                                    handler: function () {
                                        that._displayNotes(data, r.data);
                                    }
                                });
                            }, 50);
                            return Ext.String.format('<div id="{0}"></div>', id);
                        }
                         
                    }
                ],
        height: 400
   	});
   	this.down('#childPanel1').add(g); 
   },
   
    _displayNotes: function(artifactList, artifact) {
        console.log('artifact', artifact.Notes);
        var dialog = Ext.create('Rally.ui.dialog.Dialog', {
            draggable: false,
            closable: true,
            padding: 10,
            width: 600,
	    height: 400,
            overflowX: 'auto',
	    overflowY: 'auto',
            title: 'Notes of ' + artifact.FormattedID,
            items: {
                xtype: 'component',
                html: artifact.Notes,
                padding: 10
            }
        });
        this.down('#childPanel2').add(dialog);
        Ext.getCmp('cp2').update('');
        dialog.show();
    }
    
});
