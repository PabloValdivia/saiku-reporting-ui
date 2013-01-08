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
var CalculatedColumnConfigModal = ColumnConfigModal.extend({

    populate: function() {

      this.columnDefinition = this.workspace.reportSpec.fieldDefinitions[this.index];
      this.mqlSelection = this.workspace.metadataQuery.getSelection(this.index);

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

		$(this.el).find('#aggregation select').val(this.mqlSelection.aggregation); //this should be coming from the mql

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
 
    save: function() {

    	this.columnDefinition.fieldName = $(this.el).find('#displayname input').val();
    	this.columnDefinition.dataFormat = $(this.el).find('#format input').val();   

		  if(!$(this.el).find('#formula').hasClass('hide')){
			 this.columnDefinition.fieldName.formula = $(this.el).find('#formula .formula').val();   		
		  };

      this.mqlSelection.aggregation = $(this.el).find('#aggregation select').val();
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

        return true;
    },

    add_calculated_column: function(){

      //calculated column auch im modell hinzufügen
    	
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
   }
   
});