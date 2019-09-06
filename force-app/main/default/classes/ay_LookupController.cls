/**
* @File Name:	ay_LookupController
* @Description: Controller for lightning web component ayLookup
* @Author:   	Fan Yang
* @group: 		LWC
* @Modification Log	:
______________________________________________________________________________________
* Ver       Date        Author      Modification
* 1.0       2019-08-12  Fan Yang    Created the file/classes
* 1.1       2019-08-14  Fan Yang    Added filter feature
*/
public with sharing class ay_LookupController {
    public final static String DELIMITER = ' - ';
    private final static Integer MAX_RESULTS = 5;

    //search database
    //type   --  sobject type
    //searchString  --  search term
    //recordTypes  --  record types filters optional
    //fields  -- fields to query optional
    //filters  --  extra filters optional
    @AuraEnabled(Cacheable=true)
    public static List<ICB_LookupSearchResult> search(String type, String searchString, String[] recordTypes, String[] fields, String[] filters) {
        // Prepare query paramters
        searchString += '*';
        String whereClause = constructWhereClause(recordTypes, filters, true);

        SObjectType objType = Schema.getGlobalDescribe().get(type);
        if(objType == null){
            return null;
        }
        String nameField = getSobjectNameField(objType);
        if(fields == null)
            fields = new List<String>();

        if(!fields.contains(nameField)){
            fields.add(nameField);
        }

        String qStrDis = String.join(fields, ',');
            

        // Execute search query
        String query = 'FIND :searchString IN ALL FIELDS RETURNING '
                          + type +'(Id, ' + qStrDis + ' ' 
                          + whereClause + ' ORDER BY systemmodstamp) LIMIT 20';
        List<List<SObject>> results =  Search.query(query);
        List<SObject> records;  
        // System.debug('+++++++++++++records results:' + results);
        if(results.size()>0){
            records = results[0];
        }else{
            return null;
        }

        // Prepare results
        List<ICB_LookupSearchResult> ret = new List<ICB_LookupSearchResult>();
        for(SObject sobj : records){
            String n = fields.size() > 0 ? getDisplayName(sobj, fields) : (String)sobj.get(nameField);
            ICB_LookupSearchResult sr = new ICB_LookupSearchResult(
                (String)sobj.get('Id'), type, getIcon(type), n, '');

            ret.add(sr);
        }

        return ret;
    }

    //list recent view record
    //record type filter applied
    @AuraEnabled
    public static List<ICB_LookupSearchResult> searchRecentViewed(String type, String[] recordTypes, String[] fields, String[] filters){
        Set<Id> ids = new Set<Id>();
        for(RecentlyViewed rv : [Select Id, LastViewedDate From RecentlyViewed Where type = :type order by LastViewedDate Desc]){
            ids.add(rv.Id);
        }
        SObjectType objType = Schema.getGlobalDescribe().get(type);
        if(objType == null){
            return null;
        }
        String nameField = getSobjectNameField(objType);
        if(fields == null)
            fields = new List<String>();
        String qStrDis = String.join(fields, ',') + 
            (fields.contains(nameField) ? '' : nameField);

        if(ids.size() == 0)
            return null;

        else{
            List<ICB_LookupSearchResult> ret = new List<ICB_LookupSearchResult>();
            String whereClause = constructWhereClause(recordTypes, filters, false);
            String q = 'Select Id, ' + qStrDis + ' From ' + type + ' Where Id in :ids ' + whereClause + ' limit 10';
            // System.debug('--------------The query is - ' + q);
            List<SObject> qRes = Database.query(q);
            for(SObject sobj : qRes){
                String n = fields.size() > 0 ? getDisplayName(sobj, fields) : (String)sobj.get(nameField);
                ICB_LookupSearchResult sr = new ICB_LookupSearchResult(
                    (String)sobj.get('Id'), type, getIcon(type), n, '');
                ret.add(sr);
            }

            return ret;
        }
    }

    //consturct where clause
    private static String constructWhereClause(String[] recordTypes, String[] filters, Boolean startWhere){
        if(
            (recordTypes == null || recordTypes.size() == 0) && (filters == null || filters.size() == 0)
        ){
            return '';
        }

        String whereClause = '';
        if(recordTypes != null && recordTypes.size() > 0)
            whereClause = 'RecordType.DeveloperName in :recordTypes';

        if(filters != null && filters.size() > 0){
            whereClause = String.isBlank(whereClause) ? '' : ' And ';
            whereClause += String.join(filters, ' And ');
        }

        if(String.isNotBlank(whereClause) && startWhere == true)
            whereClause = 'Where ' + whereClause;

        if(startWhere == false)
            whereClause = ' And ' + whereClause;

        return whereClause;
    }

    //get icon type
    public static String getIcon(String type){
        if(type == 'employee__c' || type == 'Employee__c')
            return 'custom:custom15';

        return String.isNotBlank(type) ? 'standard:' + type.toLowerCase() : '';
    }

    /*
     * Returns the "Name" field for a given SObject (e.g. Case has CaseNumber, Account has Name)
	*/
    private static String getSobjectNameField(SobjectType sobjType){
        
        //describes lookup obj and gets its name field
        String nameField = 'Name';
        Schema.DescribeSObjectResult dfrLkp = sobjType.getDescribe();
        for(schema.SObjectField sotype : dfrLkp.fields.getMap().values()){
            Schema.DescribeFieldResult fieldDescObj = sotype.getDescribe();
            if(fieldDescObj.isNameField() ){
            	nameField = fieldDescObj.getName();
                break;
            }
        }
        return nameField;
    }

    /*
     * get a string for display
	*/
    public static String getDisplayName(SObject record, String[] fields){
        if(fields == null || fields.size() == 0){
            return '';
        }

        String[] arr = new List<String>();
        for(String f : fields){
            arr.add((String)record.get(f));
        }

        return String.join(arr, DELIMITER);
    }

    @AuraEnabled
    public static ICB_LookupSearchResult getCurrentValue(String type, String value, String[] fields){
        List<SObject> oList = getByIds(type, new List<String>{value}, fields);
        if(oList == null || oList.size()==0) {
            return null;
        }

        SObjectType objType = Schema.getGlobalDescribe().get(type);
        if(objType == null){
            return null;
        }

        String nameField = getSobjectNameField(objType);
        SObject sobj = oList[0];
        // System.debug('sobj - ' + sobj);
        // System.debug('fields - ' + fields);
        // System.debug('getDisplayName - ' + getDisplayName(sobj, fields));
        String n = (fields != null && fields.size() > 0)? getDisplayName(sobj, fields) : (String)sobj.get(nameField);
        ICB_LookupSearchResult sr = new ICB_LookupSearchResult(
            (String)sobj.get('Id'), type, getIcon(type), n, '');

		return sr;
    }


    //get all values
    @AuraEnabled
    public static List<ICB_LookupSearchResult> searchByIds(String type, String[] ids, String[] fields){
        List<SObject> oList = getByIds(type, ids, fields);
        if(oList == null || oList.size()==0) {
            return null;
        }

        SObjectType objType = Schema.getGlobalDescribe().get(type);
        if(objType == null){
            return null;
        }
        
        String nameField = getSobjectNameField(objType);
        List<ICB_LookupSearchResult> ret = new List<ICB_LookupSearchResult>();
        for(SObject sObj : oList){
            String n = (fields != null && fields.size() > 0) ? getDisplayName(sobj, fields) : (String)sobj.get(nameField);
            ret.add(new ICB_LookupSearchResult(
                (String)sobj.get('Id'), type, getIcon(type), n, '')
            );
        }

        return ret;

    }

    //query by ids
    private static List<SObject> getByIds(String type, String[] ids, String[] fields){
        if(String.isBlank(type)){
            return null;
        }
        
        SObjectType objType = Schema.getGlobalDescribe().get(type);
        if(objType == null){
            return null;
        }

        String nameField = getSobjectNameField(objType);
        if(fields == null)
            fields = new List<String>();
        String qStrDis = String.join(fields, ',') + 
            (fields.contains(nameField) ? '' : nameField);

        String query = 'Select Id, '+qStrDis+' From '+type+' Where Id = :ids';
        // System.debug('### Query: '+query);
        return Database.query(query);
    }
}