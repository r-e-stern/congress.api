var APIKEY;
var CHAM = "h"

// $.ajax({
//     url: "https://api.propublica.org/congress/v1/members/senate/ND/current.json",
//     type: 'GET',
//     beforeSend: function(x){x.setRequestHeader('X-API-Key',APIKEY);},
//     crossDomain: true,
//     dataType: 'json',
//     success: function(result){console.log(result);},
//     error: function(){}
// });

$(document).ready(function () {
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
            getReps(data.name);
        },
        mouseover: function(event,data){
            $("#maphelper").text(abbrState(data.name,"name"));
        },
        mouseout: function(event,date) {
            $("#maphelper").text("Select a state.");
        }
    });
    $("header em").click(function(){
        $(this).parent().slideUp(500);
    })
    $("table").click(function(){
        $(this).find("td").toggleClass("sel");
        if(CHAM=="h"){CHAM="s"}else{CHAM="h"}
        console.log(CHAM)
    })
});

//Taken from https://gist.github.com/calebgrove/c285a9510948b633aa47
function abbrState(a,n){var e=[["Arizona","AZ"],["Alabama","AL"],["Alaska","AK"],["Arizona","AZ"],["Arkansas","AR"],["California","CA"],["Colorado","CO"],["Connecticut","CT"],["Delaware","DE"],["Florida","FL"],["Georgia","GA"],["Hawaii","HI"],["Idaho","ID"],["Illinois","IL"],["Indiana","IN"],["Iowa","IA"],["Kansas","KS"],["Kentucky","KY"],["Kentucky","KY"],["Louisiana","LA"],["Maine","ME"],["Maryland","MD"],["Massachusetts","MA"],["Michigan","MI"],["Minnesota","MN"],["Mississippi","MS"],["Missouri","MO"],["Montana","MT"],["Nebraska","NE"],["Nevada","NV"],["New Hampshire","NH"],["New Jersey","NJ"],["New Mexico","NM"],["New York","NY"],["North Carolina","NC"],["North Dakota","ND"],["Ohio","OH"],["Oklahoma","OK"],["Oregon","OR"],["Pennsylvania","PA"],["Rhode Island","RI"],["South Carolina","SC"],["South Dakota","SD"],["Tennessee","TN"],["Texas","TX"],["Utah","UT"],["Vermont","VT"],["Virginia","VA"],["Washington","WA"],["West Virginia","WV"],["Wisconsin","WI"],["Wyoming","WY"]];if("abbr"==n){for(a=a.replace(/\w\S*/g,function(a){return a.charAt(0).toUpperCase()+a.substr(1).toLowerCase()}),i=0;i<e.length;i++)if(e[i][0]==a)return e[i][1]}else if("name"==n)for(a=a.toUpperCase(),i=0;i<e.length;i++)if(e[i][1]==a)return e[i][0]}