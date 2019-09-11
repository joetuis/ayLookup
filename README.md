# ayLookup is a Salesforce Lightning Web Component(lwc), the component has referenced other open source project but forks into different route to only focus on reusability and minimal coding to expidite your development, current supported features include:
* Search recent view records
* Auto set icons for sobjects
* Customize search result, can combine multiple columnes with less codig
* High performance using SOSL + SOQL

![lookupdemo1](https://user-images.githubusercontent.com/10925418/63737458-7d822500-c854-11e9-95a5-e0bb54303603.gif)


![lookupdemo2](https://user-images.githubusercontent.com/10925418/63737476-8a067d80-c854-11e9-98a2-34500d0ad43c.gif)


![ayLookup](https://user-images.githubusercontent.com/10925418/64737346-9d535300-d4ba-11e9-836c-8d6038c55d1e.gif)


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
