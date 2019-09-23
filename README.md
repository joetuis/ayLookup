# ayLookup is using Salesforce's latest lightning framework(lwc)  , it supports searching for all standard and custom object, others features include:
* Auto search recent view records
* Auto set icons for sobjects
* Customize search result display
* Use HTML5, ES6+
* Use Javsacript Standard events
* High performance adapting SOSL + SOQL
* Compatible with aura envrionment
* Optimiazied for SF1 Mobile Solutions


![ayLookup](https://user-images.githubusercontent.com/10925418/64737346-9d535300-d4ba-11e9-836c-8d6038c55d1e.gif)


V1.2 Optimizie Mobile Look and Feel
V1.2 Fix bugs and improve compatibility
***********************************************************************************
***********************************************************************************
*DEMO:

https://anyang-developer-edition.na136.force.com/demos/s/ay-lookup





***********************************************************************************
***********************************************************************************
#Example 1 lookupExample

*1.1 Basics

<c:ayLookup required="true" type="Account" label="Search ACCOUNT" placeholder="Search Account" sobjectType="Account">
</c:ayLookup>


*1.2 Add a record type filter
#html

*lwc  record-types={recordTypeFilters}

*aura recordTypes = "{!v.recordTypes}"

js

*lwc @track recordTypeFilters = ['0121Q000001YdotQAC'];

*aura cmp.set("v.recordTypeFilters", ["0121Q000001YdotQAC"])


Add a custom filter

filters = ["OwnerId = '005360000027hp2'"]


***********************************************************************************
***********************************************************************************

#Example 2 handleEventExample
Hanlde Event

html

selected={handleSelected}


js

handleSelected(event){
    const selected = event.detail.selection;
    console.log('***Selected:');
    console.log(selected);
}


***********************************************************************************
***********************************************************************************

#Example 3 Preset Example
To use preset seach result, we need disable recentview

html

disableRecentView = true


js

lwc

this.template.querySelector("c-ay-lookup").setPresetSearchResult(['0011Q000023elZfQAI'])

aura

var lookupComp = cmp.find("example3");

lookupComp.set("v.presetIds", '0011Q000023elZfQAI');




*********************************************************************************************
*********************************************************************************************
*********************************************************************************************
Inspiration is driven by sharing!

Enjoy the web component!!

fanxyang
