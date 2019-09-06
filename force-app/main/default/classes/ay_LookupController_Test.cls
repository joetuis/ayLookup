/**
* @File Name:	ay_LookupController_Test
* @Description: LookupController Test Class
* @Author:   	Fan Yang
* @group: 		Apex
* @Modification Log	:
______________________________________________________________________________________
* Ver       Date        Author      Modification
* 1.0       2019-08-27  Fan Yang    Created the file/classes
*/
@isTest public with sharing class ay_LookupController_Test {
    private static testmethod void testSearch1(){
        Contact c1 = new Contact(LastName = 'Test1', FirstName = 'Name1');
        insert new List<SObject>{c1};

        List<Contact> contacts = [Select Id, LastName, FirstName, Name From Contact];
        
        Test.startTest();
        
        ay_LookupSearchResult ret = ay_LookupController.getCurrentValue(null, null, null);
        System.assert(ret == null, 'Should return null string ['+ret+']');
        
        ret = ay_LookupController.getCurrentValue('INVALID_OBJECT', 'INVALID_ID', null);
        System.assert(ret == null, 'Should return null string ['+ret+']');
        
        ret = ay_LookupController.getCurrentValue('INVALID_OBJECT', '000000000000000', null);
        System.assert(ret == null, 'Should return null string ['+ret+']');
        
        ret = ay_LookupController.getCurrentValue('Contact', '000000000000000', null);
        System.assert(ret == null, 'Should return null string ['+ret+']');
        
        ret = ay_LookupController.getCurrentValue('Contact', contacts[0].Id, null);
        System.assert(ret.title == contacts[0].Name, 'Should return '+contacts[0].Name+ ' ['+ret+']');

        ay_LookupController.searchRecentViewed('Contact', null, null, null);

        List<ay_LookupSearchResult> ret2 = ay_LookupController.searchByIds('Contact', new List<String>{contacts[0].Id}, null);
        System.assert(ret2[0].title == contacts[0].Name, 'Should return '+contacts[0].Name+ ' ['+ret+']');
            
        Test.stopTest();
    }


    private static testmethod void testSearch2(){
        Contact c1 = new Contact(LastName = 'Test1papa', FirstName = 'Name1fanster');
        Contact c2 = new Contact(LastName = 'Test2', FirstName = 'Name2');
        Contact c3 = new Contact(LastName = 'Test3', FirstName = 'Name3');
        insert new List<SObject>{c1,c2,c3};

        Test.setFixedSearchResults(new List<Id>{c1.Id, c2.Id, c3.Id});


        List<List<SObject>> searchList = [
            FIND 'test' IN ALL FIELDS RETURNING Contact(id) LIMIT 20];
        System.assertNotEquals(null, searchList);
        System.debug('++++++search result=' + searchList);

        List<ay_LookupSearchResult> ret;
        Test.startTest();

        ret = ay_LookupController.search('Contact', 'Test', null, null, null);
        System.assertEquals(3, ret.size());

        String[] fields = new String[2];
        fields[0] = 'FirstName';
        fields[1] = 'LastName';
        ret = ay_LookupController.search('Contact', 'Test', null, fields, new List<String>{'FirstName=\'Name1fanster\''});
        System.assertEquals(1, ret.size());
        System.assert(ret[0].title.contains('fanster'));
        System.assert(ret[0].title.contains('papa'));
        System.assertEquals(c1.Id, ret[0].getId());
        System.assertEquals('Contact', ret[0].getSObjectType());
        System.assertEquals('standard:contact', ret[0].getIcon());
        System.assertEquals('Name1fanster - Test1papa - Name1fanster Test1papa', ret[0].getTitle());
        System.assertEquals('', ret[0].getSubtitle());

        Test.stopTest();
    }
}