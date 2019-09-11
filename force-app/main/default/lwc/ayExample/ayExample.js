import { LightningElement, api, track } from 'lwc';

export default class AyExample extends LightningElement {
    @api recordTypes;
    @api filters;
    @track recordTypesInit;
    @track filtersInit;
    @track selected;
    @track preset = ['0011Q000023elZfQAI'];
    @track presetStr = JSON.stringify(this.preset);

    connectedCallback(){
        this.recordTypes = ["0121Q000001YdotQAC"];
        this.filters = ["Name like 'zxc%'"];
        this.recordTypesInit = JSON.stringify(this.recordTypes);
        this.filtersInit = JSON.stringify(this.filters);
    }


    handleOnSelected(event){
        //selected is an array
        //{"0":{"icon":"standard:account","id":"0011Q000023elZfQAI","sObjectType":"Account","subtitle":"","title":"Lead Company2"}}"
        console.log(event.detail[0].id);
        this.selected = event.detail[0].id;
    }

    handleRecordTypeChange(){
        const target = this.template.querySelector('.record-type-input');
        try{this.recordTypes = JSON.parse(target.value);}
        catch(e){console.log(e)}
    }

    handleFilterChange(){
        const target = this.template.querySelector('.custom-filter-input');
        try{this.filters = JSON.parse(target.value);}
        catch(e){console.log(e)}

        this.handleRecordTypeChange();
    }

    handlePresetChange(event){
        try{this.preset = JSON.parse(event.target.value);}
        catch(e){console.log(e)}
    }
}