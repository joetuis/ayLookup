import { LightningElement, api, track } from 'lwc';

export default class AyExample extends LightningElement {
    @api recordTypes;
    @api filters;
    @track recordTypesInit;
    @track filtersInit;
    @track selected;
    @track preset = ['0014T0000044fVCQAY', '0014T0000044fVBQAY', '0014T0000044fVDQAY', '0014T0000044fVLQAY'];
    @track presetStr = JSON.stringify(this.preset);

    connectedCallback(){
        this.recordTypes = ["0124T000000HBGKQA4"];
        this.filters = ["Type like 'Restaurant%'"];
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