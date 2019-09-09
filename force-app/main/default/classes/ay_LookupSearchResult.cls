/**
* Class used to serialize a single Lookup search result item
* The Lookup controller returns a List<ay_LookupSearchResult> when sending search result back to Lightning
*/
public class ay_LookupSearchResult {

    @testVisible private Id id;
    @testVisible private String sObjectType;
    @testVisible private String icon;
    @testVisible private String title;
    @testVisible private String subtitle;

    public ay_LookupSearchResult(Id id, String sObjectType, String icon, String title, String subtitle) {
        this.id = id;
        this.sObjectType = sObjectType;
        this.icon = icon;
        this.title = title;
        this.subtitle = subtitle;
    }

    @AuraEnabled
    public Id getId() {
        return id;
    }

    @AuraEnabled
    public String getSObjectType() {
        return sObjectType;
    }

    @AuraEnabled
    public String getIcon() {
        return icon;
    }

    @AuraEnabled
    public String getTitle() {
        return title;
    }

    @AuraEnabled
    public String getSubtitle() {
        return subtitle;
    }
}