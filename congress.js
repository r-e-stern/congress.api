var APIKEY;
var CHAM = "house";
var STATES = ['AK','AL','AR','AZ','CA','CO','CT','DE','FL','GA','HI','IA','ID','IL','IN',
    'KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM',
    'NV','NY', 'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV',
    'WY'];

//COLOR MAP FEATURE in progress

$(document).ready(function () {
    $("header em").click(function(){
        $(this).fadeToggle(500);
        $("header i, header br:first-of-type").fadeToggle(500);
    });
    $("table").click(function(){
        $(this).find("td").toggleClass("sel");
        if(CHAM=="house"){CHAM="senate"}else{CHAM="house"}
    });
    $("header input").keyup(function(e){
        e.stopPropagation();
        APIKEY = $(this).val();
        $.ajax({
            url: "https://api.propublica.org/congress/v1/states/members/party.json",
            type: 'GET',
            beforeSend: function(x){x.setRequestHeader('X-API-Key',APIKEY);},
            crossDomain: true,
            dataType: 'json',
            success: function(result){
                $("header br:nth-of-type(2), header input").fadeToggle(500);
                $("header strong").text("Data "+result.copyright);
                var rep;
                var dem;
                var arr;
                for(var i=0; i<STATES.length; i++){
                    for(var k=0; k<result.results.senate[i][STATES[i]].length; k++){
                        console.log("Senate "+STATES[i],result.results.senate[i][STATES[i]][k]);
                    }
                    for(var j=0; j<result.results.house.length; j++){
                        if(result.results.house[j][STATES[i]]){
                            for(var l=0; l<result.results.house[j][STATES[i]].length; l++)
                            console.log("House "+STATES[i],result.results.house[j][STATES[i]][l])
                        }
                    }
                }
                $("#map").usmap({
                    stateStyles: {
                        'fill': 'white',
                        'stroke': '#ebefc9',
                        'stroke-width':1},
                    stateHoverStyles: {
                        'fill': "#d5de8e",
                        'stroke':"black",
                        'stroke-width':2},
                    showLabels: false,
                    click: function (event, data) {
                        $.ajax({
                            url: "https://api.propublica.org/congress/v1/members/"+CHAM+"/"+data.name+"/current.json",
                            type: 'GET',
                            beforeSend: function(x){x.setRequestHeader('X-API-Key',APIKEY);},
                            crossDomain: true,
                            dataType: 'json',
                            success: function(result){getReps(result, data)},
                            error: function(){}
                        });
                    },
                    mouseover: function(event,data){
                        $("#maphelper").text(abbrState(data.name,"name"));
                    },
                    mouseout: function(event,date) {
                        $("#maphelper").text("Select a state.");
                    }
                });
                console.log(result);
            },
            error: function(){}
        });
    })
});

function getReps(result, data){
    console.log(result);
    $("main").empty().append("<span>"+abbrState(data.name,"name")+"</span>");
    for(var i=0; i<result.results.length; i++){
        $("main").append("<div class='"+result.results[i].party+"'><strong>"+result.results[i].role.substr(0,3)+". "+result.results[i].name+"</strong></div>");
        if(CHAM=="house"){
            $("main div:last-child").append("<br/>District "+result.results[i].district+"<br/>");
        }else{
            $("main div:last-child").append("<br/>"+result.results[i].role+"<br/>");
        }
        if(result.results[i].facebook_account != null){
            $("main div:last-child").append("<a href='https://www.facebook.com/"+result.results[i].facebook_account+"'><img src='https://png.icons8.com/ios/2x/facebook.png'></a>");
        }
        if(result.results[i].twitter_id != null){
            $("main div:last-child").append("<a href='https://www.twitter.com/"+result.results[i].twitter_id+"'><img src='https://png.icons8.com/ios/2x/twitter.png'></a>");
        }
        $("main div:last-child").append("<img class='link' src='https://png.icons8.com/windows/540/plus.png' data-call='"+result.results[i].api_uri+"'>")
        $(".link").click(function(){
            $.ajax({
                url: $(this).data("call"),
                type: 'GET',
                beforeSend: function(x){x.setRequestHeader('X-API-Key',APIKEY);},
                crossDomain: true,
                dataType: 'json',
                success: function(result){console.log(result)},
                error: function(){}
            });
        })
    }
}

//Taken from https://gist.github.com/calebgrove/c285a9510948b633aa47
function abbrState(a,n){var e=[["Arizona","AZ"],["Alabama","AL"],["Alaska","AK"],["Arizona","AZ"],["Arkansas","AR"],["California","CA"],["Colorado","CO"],["Connecticut","CT"],["Delaware","DE"],["Florida","FL"],["Georgia","GA"],["Hawaii","HI"],["Idaho","ID"],["Illinois","IL"],["Indiana","IN"],["Iowa","IA"],["Kansas","KS"],["Kentucky","KY"],["Kentucky","KY"],["Louisiana","LA"],["Maine","ME"],["Maryland","MD"],["Massachusetts","MA"],["Michigan","MI"],["Minnesota","MN"],["Mississippi","MS"],["Missouri","MO"],["Montana","MT"],["Nebraska","NE"],["Nevada","NV"],["New Hampshire","NH"],["New Jersey","NJ"],["New Mexico","NM"],["New York","NY"],["North Carolina","NC"],["North Dakota","ND"],["Ohio","OH"],["Oklahoma","OK"],["Oregon","OR"],["Pennsylvania","PA"],["Rhode Island","RI"],["South Carolina","SC"],["South Dakota","SD"],["Tennessee","TN"],["Texas","TX"],["Utah","UT"],["Vermont","VT"],["Virginia","VA"],["Washington","WA"],["West Virginia","WV"],["Wisconsin","WI"],["Wyoming","WY"]];if("abbr"==n){for(a=a.replace(/\w\S*/g,function(a){return a.charAt(0).toUpperCase()+a.substr(1).toLowerCase()}),i=0;i<e.length;i++)if(e[i][0]==a)return e[i][1]}else if("name"==n)for(a=a.toUpperCase(),i=0;i<e.length;i++)if(e[i][1]==a)return e[i][0]}