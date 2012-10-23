/*
 * ColumnConfigModal.js
 * 
 * Copyright (c) 2012, Marius Giepz. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */
/**
 * Dialog for column configuration
 */
var ColumnConfigModal = Modal.extend({
    type: "columnconfig",
    
    buttons: [
        { text: "Save", method: "save" },
        { text: "Cancel", method: "close" }
    ],
    
    events: {
        'click a': 'call' 
    },
    
	changed: function(evt) {
		var target = $(evt.currentTarget);
  
    },    
    
    initialize: function(args) {
        // Initialize properties
        _.extend(this, args);
        this.options.title = "Setup Column " + this.name;
        this.message = "Fetching config...";
        this.show_unique = false;
        this.query = args.workspace.query;
        _.bindAll(this, "fetch_values", "populate", "finished", "changed", "add_calculated_column","error");
          
        // Resize when rendered
        this.bind('open', this.post_render);
        this.render();
        
      	this.category = args.key.split('/')[1];
        this.column = args.key.split('/')[3];
        this.index = args.index;
   
      if(!(this.category == 'CALCULATED' && this.column == 'NEW')){
      	this.fetch_values();
      }else{
      	/* Vorerst keine calculated columns mehr
      	var temp = defaultCalcColumn;
      	
      	this.json = $.extend(true, {}, defaultCalcColumn);

      	this.populate();
        */
      }

    },

    fetch_values: function(category, column) {

        this.populate();

    },

    populate: function() {

      this.columnDefinition = this.workspace.reportSpec.fieldDefinitions[this.index];

      var domainId = this.workspace.query.attributes.domainId;
      var modelId = this.workspace.query.attributes.modelId;

      var model = Application.session.mdModels[domainId + "/" + modelId];

      var metadataColumn = model.getColumnById(this.category,this.column);
      var dataType = metadataColumn.type;
      var aggTypes = metadataColumn.aggTypes;

     	var template = _.template($("#template-column-setup").html())(this);
	
     	$(this.el).find('.dialog_body').html(template);
     	
     	$(this.el).find('#description').html(this.columnDefinition.fieldDescription);
     	
     	//formula element needs to be made visible
     	if(this.category == 'CALCULATED'){
     		$(this.el).find('#formula').removeClass('hide').find('.formula').val(this.columnDefinition.formula);
     	}

     	$(this.el).find('#displayname input').val(this.columnDefinition.fieldName);
     	
     	$(this.el).find('#format input').val(this.columnDefinition.dataFormat);   	
     	if(dataType=='NUMERIC'||dataType=='DATE'){
     		$(this.el).find('#format input').removeAttr('disabled');
     	}

     	if(aggTypes!=null){
            for (var j = 0; j < aggTypes.length; j++) {
                var value = aggTypes[j];
                    $("<option />").text(AggTypes[value])
                        .val(value)
                        .appendTo($(this.el).find('#aggregation select'));
           	}
 		} 

		$(this.el).find('#aggregation select').val(this.columnDefinition.aggregationFunction); //this should be coming from the mql

		$(this.el).find('#hide_repeating').attr('checked', this.columnDefinition.hideRepeating);
 		$(this.el).find('#hide_on_report').attr('checked', this.columnDefinition.hideOnReport);
 
        for (var value in AggTypes) {
              $("<option />").text(AggTypes[value]).val(value)
                .appendTo($(this.el).find('#summary select'));    			
		}
            	
     	$(this.el).find('#summary select').val(this.columnDefinition.aggregationFunction);

     	// Show dialog
        Application.ui.unblock();
     		
    },
    
    post_render: function(args) {
    	this.center();
    },
    
    save: function() {

    	this.columnDefinition.fieldName = $(this.el).find('#displayname input').val();
    	this.columnDefinition.dataFormat = $(this.el).find('#format input').val();   

		if(!$(this.el).find('#formula').hasClass('hide')){
			this.columnDefinition.fieldName.formula = $(this.el).find('#formula .formula').val();   		
		};

    	//this.json.selectedAggType = $(this.el).find('#aggregation select').val(); <-this has to go to the querymodel  
    	this.columnDefinition.aggregationFunction = $(this.el).find('#summary select').val();  

    	this.columnDefinition.hideRepeating = $(this.el).find('#hide_repeating').is(':checked');  
    	this.columnDefinition.hideOnReport = $(this.el).find('#hide_on_report').is(':checked');  
    	
    	$(this.el).find('#hide_repeating').attr('checked', this.columnDefinition.hideRepeating);
 		   $(this.el).find('#hide_on_report').attr('checked', this.columnDefinition.hideOnReport);
 
    	//if(this.json.uid == null) this.json.uid = this.workspace.uniqueId('uid-');
    	   	
        // Notify user that updates are in progress
        this.loading = $("<div>Saving...</div>");
        $(this.el).find('.dialog_body').children().hide();
        $(this.el).find('.dialog_body').prepend(this.loading);

        this.finished();

        /*
        var self = this;
       
        // Notify server
            this.query.action.post("/COLUMNS/CATEGORY/" + this.category + "/COLUMN/" + this.column + "/POSITION/" + this.index + "/config", { 
            success: this.finished,
            error: this.error,    
            data: this.json// JSON.stringify(values)
        });
        */
        return false;
    },
    
    error: function(){
    	$(this.el).find('.dialog_body').children().show();
        this.loading.remove();
    	$(this.el).find('#formula .formula').css('border', '1px solid red');
    	console.log('wrong');
    },
    
    add_calculated_column: function(){
    	
    	var $selections = $(this.workspace.el).find('.columns ul');
	 	
		var $logicalColumn = $('.category_tree')
            .find('a[title="calc_column"]')
            .parent();

        var $clone = $logicalColumn.clone()
            .addClass('d_measure')
            .addClass('calculated')
            .attr("id",this.json.uid)
            .removeClass('hide');
          
            var href = '#CATEGORY/' + this.json.category + '/COLUMN/' + this.json.name;
            
            $clone.find('a[title="calc_column"]').attr("title",this.json.name).html(this.json.name)
            .attr("href",href);
 
            $clone.appendTo($selections);		 	
   },
    
    finished: function(response) {
/*
      	if(this.category == 'CALCULATED' && this.column == 'NEW'){
      		this.add_calculated_column();
        }
        
		$('li#' + response.uid ).find('.dimension').html(response.displayName); <- if the server wants to rename the column
*/

        $(this.el).dialog('destroy').remove();
        this.query.run();
    }
});