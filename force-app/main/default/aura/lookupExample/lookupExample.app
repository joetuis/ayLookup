<aura:application extends="force:slds" implements="force:appHostable" access="global">
    <aura:attribute name="lwc" type="Boolean" default="true" />

    <div class="container" style="padding: 10px">
        <lightning:input type="toggle" checked="{!v.lwc}" messageToggleActive="Lightning Web Component" messageToggleInactive="Lightning Component" />
        <aura:if isTrue="{!v.lwc}">
            <h1 style="font-size:20pt">Lightning Web Component</h1>
            <c:ayExample></c:ayExample>

            <aura:set attribute="else">
                <h1 style="font-size:20pt">Aura Lightning Component</h1>
                <c:example />
            </aura:set>
        </aura:if>
    </div>
</aura:application>	
