//Declare global variables.
var APIKEY;
var CHAM = "house";
var STATES = ['AK','AL','AR','AZ','CA','CO','CT','DE','FL','GA','HI','IA','ID','IL','IN',
    'KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM',
    'NV','NY', 'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV',
    'WY'];

//Upon document load:
$(document).ready(function () {
    //On header <em> click:
    $("header em").click(function(){
        //Remove instructions (but not key or (C))
        $(this).fadeOut(500);
        $("header i, header br:first-of-type").fadeOut(500);
    });
    //On senate/house click:
    $("table").click(function(){
        //Toggle senate/house
        $(this).find("td").toggleClass("sel");
        if(CHAM=="house"){CHAM="senate"}else{CHAM="house"}
    });
    //When keypressed in API KEY box:
    $("header input").keyup(function(e){
        e.stopPropagation();
        //Set the new API key (for testing)
        APIKEY = $(this).val();
        //Test API Key
        $.ajax({
            url: "https://api.propublica.org/congress/v1/states/members/party.json",
            type: 'GET',
            beforeSend: function(x){x.setRequestHeader('X-API-Key',APIKEY);},
            crossDomain: true,
            dataType: 'json',
            //If API Key succeeds:
            success: function(result){
                var res = result.results;
                //Remove the dialog by which to change the (working) API key
                $("header br:nth-of-type(2), header input").empty().fadeOut(500);
                //Add the newly-generated &copy; disclaimer
                $("header strong").text("Data "+result.copyright);
                var rep;
                var dem;
                var col;
                var arr=[];
                var ct;
                //Calculate each state's partisanship:
                //Uses results from API call
                for(var i=0; i<STATES.length; i++){
                    rep=[0,0];
                    dem=[0,0];
                    //Count Republicans in Senate
                    for(var k=0; k<res.senate[i][STATES[i]].length; k++){
                        ct=res.senate[i][STATES[i]][k];
                        if(Object.keys(ct)[0]=="REP"){
                            rep[0]+=parseFloat(ct[Object.keys(ct)[0]]);
                        }
                    }
                    //Count both parties in House
                    for(var j=0; j<res.house.length; j++){
                        if(res.house[j][STATES[i]]){
                            for(var l=0; l<res.house[j][STATES[i]].length; l++){
                                ct=res.house[j][STATES[i]][l];
                                if(Object.keys(ct)[0]=="REP"){
                                    rep[1]+=parseFloat(ct[Object.keys(ct)[0]]);
                                }else{
                                    dem[1]+=parseFloat(ct[Object.keys(ct)[0]])
                                }
                            }
                        }
                    }
                    //Extrapolate party %s to a hex code
                    col = gradient("5555cc","cc5555",99)[Math.floor((.5*(rep[0]/2)+.5*(rep[1]/(rep[1]+dem[1])))*100)];
                    arr.push([STATES[i],col]);
                }
                //Initialize the map module with the colors in question
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
                //add each state and its color to the string
                for(var i=0; i<arr.length; i++){
                    buildMap+="                        '"+arr[i][0]+"': {fill: '"+arr[i][1]+"'},\n";
                }
                buildMap+="                    },\n"+
                    //when a state is clicked:
                    "                    click: function (event, data) {\n" +
                    "                        $.ajax({\n" +
                    //get its members (by active chamber button)
                    "                            url: 'https://api.propublica.org/congress/v1/members/'+CHAM+'/'+data.name+'/current.json',\n" +
                    "                            type: 'GET',\n" +
                    "                            beforeSend: function(x){x.setRequestHeader('X-API-Key',APIKEY);},\n" +
                    "                            crossDomain: true,\n" +
                    "                            dataType: 'json',\n" +
                    //call getReps() with the results
                    "                            success: function(result){getReps(result, data)},\n" +
                    "                            error: function(){}\n" +
                    "                        });\n" +
                    "                    },\n" +
                    //As states are moused over display their names.
                    "                    mouseover: function(event,data){\n" +
                    "                        $('#maphelper').text(abbrState(data.name,'name'));\n" +
                    "                    },\n" +
                    "                    mouseout: function(event,date) {\n" +
                    "                        $('#maphelper').text('Select a state.');\n" +
                    "                    }\n" +
                    "                });";
                //execute the string as code
                eval(buildMap);
                //show the map
                $("#map").toggle().fadeIn(500);
            },
            //if API Key fails, nothing happens.
            error: function(){}
        });
    })
});

//Called when a state is clicked
function getReps(result, data){
    //Empty the active area
    $("main").empty().append("<span>"+abbrState(data.name,"name")+"</span>");
    var res;
    //for each member:
    for(var i=0; i<result.results.length; i++){
        res = result.results[i];
        //generate a div with their name, title, party (as color), social media, and a "more" button
        $("main").append("<div class='"+res.party+"'><strong>"+res.role.substr(0,3)+". "+res.name+"</strong></div>");
        if(CHAM=="house"){
            $("main div:last-child").append("<br/>District "+res.district+"<br/>");
        }else{
            $("main div:last-child").append("<br/>"+res.role+"<br/>");
        }
        if(result.results[i].facebook_account != null){
            $("main div:last-child").append("<a href='https://www.facebook.com/"+res.facebook_account+"'><img src='https://png.icons8.com/ios/2x/facebook.png'></a>");
        }
        if(result.results[i].twitter_id != null){
            $("main div:last-child").append("<a href='https://www.twitter.com/"+res.twitter_id+"'><img src='https://png.icons8.com/ios/2x/twitter.png'></a>");
        }
        $("main div:last-child").append("<img class='link' src='https://png.icons8.com/windows/540/plus.png' data-call='"+res.api_uri+"'>").toggle();
    }
    //display them all at 125-millisecond intervals
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
                var res = result.results[0];
                var resrol = res.roles[0];
                $("main:nth-last-child(2)").after("<aside class='"+res.current_party.substr(0,1)
                    +"'><em>X</em><span><i>"+resrol.short_title+" "
                    +res.first_name
                    +" "+res.last_name+"</i><br><s>"
                    +resrol.party[0]+"-"
                    +abbrState(resrol.state,"name")
                    +"</s></span><br/><div>"
                    +resrol.short_title+" "
                    +res.first_name+" "
                    +res.last_name+" votes with "
                    +pronoun(res.gender,"possessive")
                    +" party ("+resrol.party+") "
                    +resrol.votes_with_party_pct
                    +"% of the time.<br> " +capitalPronoun(res.gender,"personal")
                    +" has sponsored "+resrol.bills_sponsored
                    +" bills in the "+cardinaltoOrdinal(parseFloat(resrol.congress))
                    +" Congress.<br/>"
                    +"<span id='container'></span>"
                    +pronoun(res.gender,"possessive")[0].toUpperCase()+pronoun(res.gender,"possessive").substr(1)
                    +" office is located at "
                    +resrol.office+". <br/>It can be reached at "
                    +resrol.phone+".</div></aside>");
                var comm_str="";
                if(resrol.committees.length==0){
                    comm_str=capitalPronoun(res.gender,"personal")
                }
                var comm;
                for(var i=0; i<resrol.committees.length; i++){
                    comm=resrol.committees[i]
                    if(i==0 && resrol.committees.length!=1){
                        comm_str+=capitalPronoun(res.gender,"personal")
                            +" is a "+comm.side+" "
                            +comm.title.toLowerCase()
                            +" of the "+comm.name
                            +",";
                    }else if(((i+1)==resrol.committees.length) && (resrol.committees.length!=1)){
                        comm_str+=" and a "+comm.title.toLowerCase()+" of the "
                            +comm.name+".</br>";
                    }else if(resrol.committees.length==1){
                        comm_str+=capitalPronoun(res.gender,"personal")
                            +" is a "+comm.side+" "
                            +comm.title.toLowerCase()
                            +" of the "+comm.name
                            +".<br/>";
                    }else{
                        comm_str+=" a "+comm.title.toLowerCase()
                        +" of the "+comm.name+",";
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


//Taken and minified from https://gist.github.com/calebgrove/c285a9510948b633aa47
function abbrState(a,n){var e=[["Arizona","AZ"],["Alabama","AL"],["Alaska","AK"],["Arizona","AZ"],["Arkansas","AR"],["California","CA"],["Colorado","CO"],["Connecticut","CT"],["Delaware","DE"],["Florida","FL"],["Georgia","GA"],["Hawaii","HI"],["Idaho","ID"],["Illinois","IL"],["Indiana","IN"],["Iowa","IA"],["Kansas","KS"],["Kentucky","KY"],["Kentucky","KY"],["Louisiana","LA"],["Maine","ME"],["Maryland","MD"],["Massachusetts","MA"],["Michigan","MI"],["Minnesota","MN"],["Mississippi","MS"],["Missouri","MO"],["Montana","MT"],["Nebraska","NE"],["Nevada","NV"],["New Hampshire","NH"],["New Jersey","NJ"],["New Mexico","NM"],["New York","NY"],["North Carolina","NC"],["North Dakota","ND"],["Ohio","OH"],["Oklahoma","OK"],["Oregon","OR"],["Pennsylvania","PA"],["Rhode Island","RI"],["South Carolina","SC"],["South Dakota","SD"],["Tennessee","TN"],["Texas","TX"],["Utah","UT"],["Vermont","VT"],["Virginia","VA"],["Washington","WA"],["West Virginia","WV"],["Wisconsin","WI"],["Wyoming","WY"]];if("abbr"==n){for(a=a.replace(/\w\S*/g,function(a){return a.charAt(0).toUpperCase()+a.substr(1).toLowerCase()}),i=0;i<e.length;i++)if(e[i][0]==a)return e[i][1]}else if("name"==n)for(a=a.toUpperCase(),i=0;i<e.length;i++)if(e[i][1]==a)return e[i][0]}

//Taken and minified from https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
function cardinaltoOrdinal(n){var r=n%10,t=n%100;return 1==r&&11!=t?n+"st":2==r&&12!=t?n+"nd":3==r&&13!=t?n+"rd":n+"th"}

function gradient(colora, colorb, stops){
    //Breaks hecidecimal into decimal RGB values
    var colora1 = parseInt(colora.substring(0,2),16);
    var colora2 = parseInt(colora.substring(2,4),16);
    var colora3 = parseInt(colora.substring(4,6),16);
    var colorb1 = parseInt(colorb.substring(0,2),16);
    var colorb2 = parseInt(colorb.substring(2,4),16);
    var colorb3 = parseInt(colorb.substring(4,6),16);
    var weight = 0;
    var r = 0;
    var g = 0;
    var b = 0;
    var color = [];
    //Generates stops+2 colors between the given ones, exports as hex array
    for(var i=0; i<(2+stops); i++){
        weight = i/(1+stops);
        r = Math.floor(colorb1*weight + colora1*(1-weight)).toString(16);
        g = Math.floor(colorb2*weight + colora2*(1-weight)).toString(16);
        b = Math.floor(colorb3*weight + colora3*(1-weight)).toString(16);
        if(r.length==1){r="0"+r;}
        if(g.length==1){g="0"+g;}
        if(b.length==1){b="0"+b}
        color.push("#"+r+g+b);
    }
    return color;
}

function pronoun(g,t){
    g=g.toLowerCase();
    if(g=="m"){if(t=="possessive"){return "his";}else if(t=="reflexive"){return "himself";}else{return "he";}
    }else if(g=="f"){if(t=="possessive"){return "her";}else if(t=="reflexive"){return "herself";}else{return "she";}
    }else{if(t=="possessive"){return "their";}else if(t=="reflexive"){return "themself";}else{return "they";}}
}

function capitalPronoun(g,t){
    return pronoun(g,t)[0].toUpperCase()+pronoun(g,t).substr(1);
}