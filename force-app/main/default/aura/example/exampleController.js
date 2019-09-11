({
    doInit : function(cmp, e, helper){
        cmp.set("v.recordTypes", ["0121Q000001YdotQAC"])
        cmp.set("v.filters", ["OwnerId = '005360000027hp2'"])
        // debugger;
        var ex2 = cmp.find("example3");
        //ex2.setPresetSearchResult(['0011Q000023elZfQAI']);//this currently is not working properly in aura.
        ex2.set("v.presetIds", '0011Q000023elZfQAI');
    },


    handleOnSelected : function(cmp, e, helper){
        //selected is an array
        //{"0":{"icon":"standard:account","id":"0011Q000023elZfQAI","sObjectType":"Account","subtitle":"","title":"Lead Company2"}}"
        var selected = [];
        selected = e.getParams('detail');
        console.log(selected[0].id);
    }
})
