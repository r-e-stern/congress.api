var APIKEY;
var CHAM = "house";
var STATES = ['AK','AL','AR','AZ','CA','CO','CT','DE','FL','GA','HI','IA','ID','IL','IN',
    'KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM',
    'NV','NY', 'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV',
    'WY'];

//Fix Details pane
//Fix committees

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
                $("header br:nth-of-type(2), header input").empty().fadeOut(500);
                $("header strong").text("Data "+result.copyright);
                var rep;
                var dem;
                var col;
                var arr=[];
                for(var i=0; i<STATES.length; i++){
                    rep=[0,0];
                    dem=[0,0];
                    for(var k=0; k<result.results.senate[i][STATES[i]].length; k++){
                        if(Object.keys(result.results.senate[i][STATES[i]][k])[0]=="REP"){
                            rep[0]+=parseFloat(result.results.senate[i][STATES[i]][k][Object.keys(result.results.senate[i][STATES[i]][k])[0]]);
                        }
                    }
                    for(var j=0; j<result.results.house.length; j++){
                        if(result.results.house[j][STATES[i]]){
                            for(var l=0; l<result.results.house[j][STATES[i]].length; l++){
                                if(Object.keys(result.results.house[j][STATES[i]][l])[0]=="REP"){
                                    rep[1]+=parseFloat(result.results.house[j][STATES[i]][l][Object.keys(result.results.house[j][STATES[i]][l])[0]]);
                                }else{
                                    dem[1]+=parseFloat(result.results.house[j][STATES[i]][l][Object.keys(result.results.house[j][STATES[i]][l])[0]])
                                }
                            }
                        }
                    }
                    col = gradient("5555cc","cc5555",99)[Math.floor((.5*(rep[0]/2)+.5*(rep[1]/(rep[1]+dem[1])))*100)];
                    arr.push([STATES[i],col]);
                }
                var buildMap = "$('#map').usmap({\n" +
                    "                    stateStyles: {\n" +
                    "                        'fill': 'white',\n" +
                    "                        'stroke': '#ebefc9',\n" +
                    "                        'stroke-width':1.2},\n" +
                    "                    stateHoverStyles: {\n" +
                    "                        'fill': 'white',\n" +
                    "                        'stroke': 'black',\n"+
                    "                        'stroke-width': 2},\n"+
                    "                    showLabels: false,\n"+
                    "                    stateSpecificStyles:  {\n";
                for(var i=0; i<arr.length; i++){
                    buildMap+="                        '"+arr[i][0]+"': {fill: '"+arr[i][1]+"'},\n";
                }
                buildMap+="                    },\n"+
                    "                    click: function (event, data) {\n" +
                    "                        $.ajax({\n" +
                    "                            url: 'https://api.propublica.org/congress/v1/members/'+CHAM+'/'+data.name+'/current.json',\n" +
                    "                            type: 'GET',\n" +
                    "                            beforeSend: function(x){x.setRequestHeader('X-API-Key',APIKEY);},\n" +
                    "                            crossDomain: true,\n" +
                    "                            dataType: 'json',\n" +
                    "                            success: function(result){getReps(result, data)},\n" +
                    "                            error: function(){}\n" +
                    "                        });\n" +
                    "                    },\n" +
                    "                    mouseover: function(event,data){\n" +
                    "                        $('#maphelper').text(abbrState(data.name,'name'));\n" +
                    "                    },\n" +
                    "                    mouseout: function(event,date) {\n" +
                    "                        $('#maphelper').text('Select a state.');\n" +
                    "                    }\n" +
                    "                });";
                eval(buildMap);
                $("#map").toggle().fadeIn(500);
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
        $("main div:last-child").append("<img class='link' src='https://png.icons8.com/windows/540/plus.png' data-call='"+result.results[i].api_uri+"'>").toggle();
    }
    for(var i=0; i<result.results.length+1; i++){
        eval("$('main div:nth-child("+(i+1)+")').delay("+(125*i)+").fadeIn(250)");
    }
    $(".link").mouseup(function(e){
        e.stopImmediatePropagation();
        $.ajax({
            url: $(this).data("call"),
            type: 'GET',
            beforeSend: function(x){x.setRequestHeader('X-API-Key',APIKEY);},
            crossDomain: true,
            dataType: 'json',
            success: function(result){
                console.log(result);
                $("main:nth-last-child(2)").after("<aside class='"+result.results[0].current_party.substr(0,1)
                    +"'><em>X</em><span><i>"+result.results[0].roles[0].short_title+" "
                    +result.results[0].first_name
                    +" "+result.results[0].last_name+"</i><br><s>"
                    +result.results[0].roles[0].party[0]+"-"
                    +abbrState(result.results[0].roles[0].state,"name")
                    +"</s></span><br/><div>"
                    +result.results[0].roles[0].short_title+" "
                    +result.results[0].first_name+" "
                    +result.results[0].last_name+" votes with "
                    +pronoun(result.results[0].gender,"possessive")
                    +" party ("+result.results[0].roles[0].party+") "
                    +result.results[0].roles[0].votes_with_party_pct
                    +"% of the time.<br> " +pronoun(result.results[0].gender,"personal")[0].toUpperCase()+pronoun(result.results[0].gender,"personal").substr(1)
                    +" has sponsored "+result.results[0].roles[0].bills_sponsored
                    +" bills in the "+cardinaltoOrdinal(parseFloat(result.results[0].roles[0].congress))
                    +" Congress.<br/>"
                    +"<span id='container'></span>"
                    +pronoun(result.results[0].gender,"possessive")[0].toUpperCase()+pronoun(result.results[0].gender,"possessive").substr(1)
                    +" office is located at "
                    +result.results[0].roles[0].office+". <br/>It can be reached at "
                    +result.results[0].roles[0].phone+".</div></aside>");
                var comm_str="";
                for(var i=0; i<result.results[0].roles[0].committees.length; i++){
                    if(i==0 && result.results[0].roles[0].committees.length!=1){
                        comm_str+=pronoun(result.results[0].gender,"personal")[0].toUpperCase()+pronoun(result.results[0].gender,"personal").substr(1)
                            +" is a "+result.results[0].roles[0].committees[i].side+" "
                            +result.results[0].roles[0].committees[i].title.toLowerCase()
                            +" of the "+result.results[0].roles[0].committees[i].name
                            +",";
                    }else if(i+1==result.results[0].roles[0].committees && result.results[0].roles[0].committees.length!=1){
                        comm_str+=" and a "+result.results[0].roles[0].committees[i].title.toLowerCase()+" of the "
                            +result.results[0].roles[0].committees[i].name+".</br>";
                    }else if(result.results[0].roles[0].committees.length==1){
                        //only one committee
                    }else{
                        comm_str+=" a "+result.results[0].roles[0].committees[i].title.toLowerCase()
                        +" of the "+result.results[0].roles[0].committees[i].name+",";
                    }
                }
                $("#container").append(comm_str).contents().unwrap();
                $("aside").toggle().fadeIn(500);
                $("aside em").click(function(){$("aside").fadeOut(500,function(){$("aside").remove()});
                });
            },
            error: function(){}
        });
    })
}


//Taken from https://gist.github.com/calebgrove/c285a9510948b633aa47
function abbrState(a,n){var e=[["Arizona","AZ"],["Alabama","AL"],["Alaska","AK"],["Arizona","AZ"],["Arkansas","AR"],["California","CA"],["Colorado","CO"],["Connecticut","CT"],["Delaware","DE"],["Florida","FL"],["Georgia","GA"],["Hawaii","HI"],["Idaho","ID"],["Illinois","IL"],["Indiana","IN"],["Iowa","IA"],["Kansas","KS"],["Kentucky","KY"],["Kentucky","KY"],["Louisiana","LA"],["Maine","ME"],["Maryland","MD"],["Massachusetts","MA"],["Michigan","MI"],["Minnesota","MN"],["Mississippi","MS"],["Missouri","MO"],["Montana","MT"],["Nebraska","NE"],["Nevada","NV"],["New Hampshire","NH"],["New Jersey","NJ"],["New Mexico","NM"],["New York","NY"],["North Carolina","NC"],["North Dakota","ND"],["Ohio","OH"],["Oklahoma","OK"],["Oregon","OR"],["Pennsylvania","PA"],["Rhode Island","RI"],["South Carolina","SC"],["South Dakota","SD"],["Tennessee","TN"],["Texas","TX"],["Utah","UT"],["Vermont","VT"],["Virginia","VA"],["Washington","WA"],["West Virginia","WV"],["Wisconsin","WI"],["Wyoming","WY"]];if("abbr"==n){for(a=a.replace(/\w\S*/g,function(a){return a.charAt(0).toUpperCase()+a.substr(1).toLowerCase()}),i=0;i<e.length;i++)if(e[i][0]==a)return e[i][1]}else if("name"==n)for(a=a.toUpperCase(),i=0;i<e.length;i++)if(e[i][1]==a)return e[i][0]}

//Taken from iTunes API
function gradient(t,r,n){for(var s=parseInt(t.substring(0,2),16),g=parseInt(t.substring(2,4),16),a=parseInt(t.substring(4,6),16),e=parseInt(r.substring(0,2),16),i=parseInt(r.substring(2,4),16),o=parseInt(r.substring(4,6),16),u=0,h=0,p=0,b=0,l=[],I=0;2+n>I;I++)u=I/(1+n),h=Math.floor(e*u+s*(1-u)).toString(16),p=Math.floor(i*u+g*(1-u)).toString(16),b=Math.floor(o*u+a*(1-u)).toString(16),1==h.length&&(h="0"+h),1==p.length&&(p="0"+p),1==b.length&&(b="0"+b),l.push("#"+h+p+b);return l}

//Taken from https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number via Horoscope
function cardinaltoOrdinal(n){var r=n%10,t=n%100;return 1==r&&11!=t?n+"st":2==r&&12!=t?n+"nd":3==r&&13!=t?n+"rd":n+"th"}

function pronoun(g,t){
    g=g.toLowerCase();
    if(g=="m"){
        if(t=="possessive"){
            return "his";
        }else if(t=="reflexive"){
            return "himself";
        }else{
            return "he";
        }
    }else if(g=="f"){
        if(t=="possessive"){
            return "her";
        }else if(t=="reflexive"){
            return "herself";
        }else{
            return "she";
        }
    }else{
        if(t=="possessive"){
            return "their";
        }else if(t=="reflexive"){
            return "themself";
        }else{
            return "they";
        }
    }
}