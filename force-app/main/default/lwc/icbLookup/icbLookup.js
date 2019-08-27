/**
* @File Name:	icbLookup
* @Description: Component to Search relationship 
* @Example <c:icbLookup required="true" type="Account" label="Search" placeholder="Search Account" sobjectType="Account">
           </c:icbLookup>
* @Author:   	Fan Yang
* @group: 		LWC
* @Modification Log	:
______________________________________________________________________________________
* Ver       Date        Author      Modification
* 1.0       2019-08-12  Fan Yang    Created the file/classes
* 1.1       2019-08-14  Fan Yang    Add filters
* 1.2       2019-08-14  Fan Yang    Add onselect event
*/

import { LightningElement, track, api } from 'lwc';
import searchAction from '@salesforce/apex/ICB_LookupController.search';
import searchRecentViewed from '@salesforce/apex/ICB_LookupController.searchRecentViewed';
import getCurrentValue from '@salesforce/apex/ICB_LookupController.getCurrentValue';

const MINIMAL_SEARCH_TERM_LENGTH = 2; // Min number of chars required to search
const SEARCH_DELAY = 300; // Wait 300 ms after user stops typing then, peform search

export default class IcbLookup extends LightningElement {
    @api sobjectType;
    @api recordTypes = null;
    @api fields = [];
    @api label;
    @api selection = [];
    @api placeholder = '';
    @api isMultiEntry = false;
    @api errors = [];
    @api scrollAfterNItems;
    @api required; 
    soqlFilter = [];//add query filter i.e.: ["phone like '417%'"] beware of encrypted fields doesn't support
    @api  
    get filters(){return this.soqlFilter;}
    set filters(value){
        this.soqlFilter = value;
        this.getRecentView();
    }
    @track searchTerm = '';
    @track searchResults = [];
    @track hasFocus = false;
    @track infoMessage;

    cleanSearchTerm;
    blurTimeout;
    searchThrottlingTimeout;
    recentViewed;
    
    @api get value(){return this.selection;}
    set value(value){
        if(!value){
            this.selection = [];
        }else{
            getCurrentValue({
                "type" : this.sobjectType,
                "value" : value,
                "fields" : this.fields
            }).then(result => {
                this.selection = [result];
                this.fireSelected();
            })
        }
    }

    @api setSearchResults(results) {
        if(results && results.length === 0){
            this.searchResults = [];
            this.infoMessage = 'No Result Found';
            return;
        }

        this.searchResults = results.map(result => {
            if (typeof result.icon === 'undefined') {
                result.icon = 'standard:default';
            }
            return result;
        });
    }

    //aync search
    @api async doSearch(q){
        if(!this.sobjectType)
            throw new Error("SObject is not defined, unable to search");

        this.infoMessage = "";

    // debugger;
        searchAction({
            "type" : this.sobjectType, 
            "searchString" : q.searchTerm, 
            "recordTypes" : this.recordTypes,
            "fields" : this.fields,
            "filters" : this.filters
        })
        .then(results => {
            this.setSearchResults(results);
        })
        .catch(error => {
            // eslint-disable-next-line no-console
            console.error('Lookup error', JSON.stringify(error));
            this.errors = ["Unexpcted Error Occurred"];
        });
    }

    @api get showMessage(){
        return !!this.infoMessage && !!this.searchTerm;
    }

    @api get type(){return this.sobjectType;}

    connectedCallback(){
        this.getRecentView();
    }

    @api focus(){
        this.template.querySelector('input.search-input').focus();
    }

    @api blur(){
        this.template.querySelector('input.search-input').blur();
    }

    getRecentView(){
        this.recentViewed = [];
        searchRecentViewed(
            {
                "type" : this.sobjectType,
                "recordTypes" : this.recordTypes,
                "fields" : this.fields,
                "filters" : this.filters
            }
        ).then(results => {
            this.recentViewed = results;
            this.searchResults = results
        })
        .catch(err => {
            console.error(err);
            throw new Error("Error calling searchRecentViewed: " + err)
        })
    }


// INTERNAL FUNCTIONS

    updateSearchTerm(newSearchTerm) {
        this.searchTerm = newSearchTerm;

        // Compare clean new search term with current one and abort if identical
        const newCleanSearchTerm = newSearchTerm.trim().replace(/\*/g, '').toLowerCase();
        if (this.cleanSearchTerm === newCleanSearchTerm) {
            return;
        }

        // Save clean search term
        this.cleanSearchTerm = newCleanSearchTerm;

        if(newCleanSearchTerm.length === 0){
            this.searchResults = this.recentViewed;
            return;
        }

        // Ignore search terms that are too small
        if (newCleanSearchTerm.length < MINIMAL_SEARCH_TERM_LENGTH) {
            this.searchResults = [];
            return;
        }

        // Apply search throttling (prevents search if user is still typing)
        if (this.searchThrottlingTimeout) {
            clearTimeout(this.searchThrottlingTimeout);
        }
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.searchThrottlingTimeout = setTimeout(() => {
                // Send search event if search term is long enougth
                if (this.cleanSearchTerm.length >= MINIMAL_SEARCH_TERM_LENGTH) {
                    // const searchEvent = new CustomEvent('search', {
                    //     detail: {
                    //         searchTerm: this.cleanSearchTerm,
                    //         selectedIds: this.selection.map(element => element.id)
                    //     }
                    // });
                    // this.dispatchEvent(searchEvent);
                    this.doSearch(
                        {searchTerm: this.cleanSearchTerm, selectedIds: this.selection.map(element => element.id)}
                    );
                }
                this.searchThrottlingTimeout = null;
            },
            SEARCH_DELAY
        );
    }

    isSelectionAllowed() {
        if (this.isMultiEntry) {
            return true;
        }
        return !this.hasSelection();
    }

    hasResults() {
        return this.searchResults.length > 0;
    }

    hasSelection() {
        return this.selection.length > 0;
    }


    // EVENT HANDLING
    handleInput(event) {
        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }
        this.updateSearchTerm(event.target.value);
    }

    handleResultClick(event) {
        const recordId = event.currentTarget.dataset.recordid;

        // Save selection
        let selectedItem = this.searchResults.filter(result => result.id === recordId);
        if (selectedItem.length === 0) {
            return;
        }
        selectedItem = selectedItem[0];
        const newSelection = [...this.selection];
        newSelection.push(selectedItem);
        this.selection = newSelection;

        // Reset search
        this.searchTerm = '';
        this.searchResults = this.recentViewed.length > 0 ? this.recentViewed : [];


        // Notify parent components that selection has changed
        this.fireSelected();
    }

    fireSelected(){
        this.dispatchEvent(new CustomEvent('selected', {
            detail : this.selection
        }));
        this.dispatchEvent(new CustomEvent('select', {
            detail : this.selection
        }));
        this.errors = [];
    }

    handleComboboxClick() {
        // Hide combobox immediatly
        if (this.blurTimeout) {
            window.clearTimeout(this.blurTimeout);
        }
        this.hasFocus = false;
    }

    handleFocus() {
        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }
        this.hasFocus = true;
    }

    handleBlur() {
        // debugger;
        if(this.required && !this.hasSelection())
            this.errors = ["Complete this field"];

        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }

        // Delay hiding combobox so that we can capture selected result
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.blurTimeout = window.setTimeout(() => {
                this.hasFocus = false;
                this.blurTimeout = null;
            },
            300
        );
    }

    handleRemoveSelectedItem(event) {
        const recordId = event.currentTarget.name;
        this.selection = this.selection.filter(item => item.id !== recordId);
        // Notify parent components that selection has changed
        this.fireSelected();
    }

    handleClearSelection() {
        this.selection = [];
        // Notify parent components that selection has changed
        this.fireSelected();
    }


// STYLE EXPRESSIONS

    get getContainerClass() {
        let css = 'slds-combobox_container slds-has-inline-listbox ';
        if (this.hasFocus && this.hasResults()) {
            css += 'slds-has-input-focus ';
        }
        if (this.errors.length > 0) {
            css += 'has-custom-error';
        } 
        return css;
    }

    get getDropdownClass() {
        let css = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ';
        if (this.hasFocus && this.hasResults()) {
            css += 'slds-is-open';
        } else {
            css += 'slds-combobox-lookup';
        }
        return css;
    }

    get getInputClass() {
        let css = 'slds-input slds-combobox__input has-custom-height search-input '
            + (this.errors.length === 0 ? '' : 'has-custom-error ');
        if (!this.isMultiEntry) {
            css += 'slds-combobox__input-value '
                + (this.hasSelection() ? 'has-custom-border' : '');
        }
        return css;
    }

    get getComboboxClass() {
        let css = 'slds-combobox__form-element slds-input-has-icon ';
        if (this.isMultiEntry) {
            css += 'slds-input-has-icon_right';
        } else {
            css += (this.hasSelection() ? 'slds-input-has-icon_left-right' : 'slds-input-has-icon_right');
        }
        return css;
    }

    get getSearchIconClass() {
        let css = 'slds-input__icon slds-input__icon_right ';
        if (!this.isMultiEntry) {
            css += (this.hasSelection() ? 'slds-hide' : '');
        }
        return css;
    }

    get getClearSelectionButtonClass() {
        return 'slds-button slds-button_icon slds-input__icon slds-input__icon_right '
            + (this.hasSelection() ? '' : 'slds-hide');
    }

    get getSelectIconName() {
        return this.hasSelection() ? this.selection[0].icon : 'standard:default';
    }

    get getSelectIconClass() {
        return 'slds-combobox__input-entity-icon '
            + (this.hasSelection() ? '' : 'slds-hide');
    }

    get getInputValue() {
        if (this.isMultiEntry) {
            return this.searchTerm;
        }
        return this.hasSelection() ? this.selection[0].title : this.searchTerm;
    }

    get getListboxClass() {
        return 'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid '
            + (this.scrollAfterNItems ? 'slds-dropdown_length-with-icon-' + this.scrollAfterNItems : '');
    }

    get isInputReadonly() {
        if (this.isMultiEntry) {
            return false;
        }
        return this.hasSelection();
    }

    get isExpanded() {
        return this.hasResults();
    }
}