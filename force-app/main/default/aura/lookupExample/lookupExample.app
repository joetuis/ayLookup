<aura:application extends="force:slds" implements="force:appHostable" access="global">
    <h1>New lookup example</h1>
    <div class="slds-grid slds-gutters">
        <div class="slds-col slds-size_1-of-2">
            <c:ayLookup required="true" type="Account" label="Search" placeholder="Search Account" sobjectType="Account">
            </c:ayLookup>
        </div>
    </div>
</aura:application>	
