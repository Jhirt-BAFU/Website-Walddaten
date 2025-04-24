
function makeSPARQLQuery( endpointUrl, sparqlQuery, doneCallback ) {
	var settings = {
		headers: { Accept: 'application/sparql-results+json' },
		data: { query: sparqlQuery }
	};
	return $.ajax( endpointUrl, settings ).then( doneCallback );
}

var endpointUrl = 'https://query.wikidata.org/sparql',
	sparqlQuery =
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +
        "SELECT ?alt ?sn ?occ WHERE {\n" +
        "<https://ld.admin.ch/wald/waldgesellschaften/1> <https://ld.admin.ch/wald/waldgesellschaften/occursAtAltitude> ?obj .\n" +
        "?obj <https://ld.admin.ch/wald/waldgesellschaften/altitude/occurrence/hasAltitude> ?altitude.\n" +
        "?obj <https://ld.admin.ch/wald/waldgesellschaften/altitude/occurrence/hasOccurrence> ?occurrence.\n" +
        "?occurrence <http://schema.org/identifier> ?occ.\n" +
        "?altitude <https://ld.admin.ch/wald/waldgesellschaften/altitude/startswith> ?alt.\n"
        "?altitude <https://ld.admin.ch/wald/waldgesellschaften/altitude/shortname> ?sn\n"
        "}";

makeSPARQLQuery( endpointUrl, sparqlQuery, function( data ) {
		$( 'body' ).append( $( '<pre>' ).text( JSON.stringify( data ) ) );
		console.log( data );
	}
);

let tooltipText = {
    "rare": {
      "de": "selten",
      "fr": "rare"
    },
    "lessFrequent": {
      "de": "weniger häufig",
      "fr": "moins fréquente"
    },
    "veryFrequent": {
      "de": "sehr häufig",
      "fr": "très fréquente"
    }
  }
  let par = {"code": "8a", "lang": "de"};
 

  /* This function returns meta information about a given type and code. 
      If the code parameter is missing a list of all available codes is returned. 
      This meta information includes translations and type specific data. 
      See data/types.json for all available types and codes. */
  function info(type, code) {
    return types[type].filter(t => t.code == code)[0];
  }
  
  /* This functions parametrizes the diagrams for a given forestType */
  function parametrizeDiagrams(code) {
    let forestType = info("forestType", code);
    // reset all parameters to default state "rare"
    document.querySelectorAll(".veryFrequent, .lessFrequent, .rare").forEach((elem)=>{setFrequency(elem, "rare")});
    // set selected parameters for frequency ("veryFrequent", "lessFrequent")
    forestType.veryFrequent.forEach((id)=>{setFrequency(document.getElementById(id), "veryFrequent")});
    forestType.lessFrequent.forEach((id)=>{setFrequency(document.getElementById(id), "lessFrequent")});
    // set title for forest type
    let elem = document.getElementById("forestType");
    elem.querySelector(".de").innerHTML = forestType.code + " - " + forestType.de;
    elem.querySelector(".fr").innerHTML = forestType.code + " - " + forestType.fr;
    par.code = code;
  }
  
  /* helper functions to set state to "rare", "lessFrequent" or "veryFrequent" */
  function setFrequency(elem, freq) {
    elem.classList = [freq];
    elem.onmousemove = ()=>{showTooltip(event, tooltipText[freq])};
  }
  
  /* helper functions to show & hide tooltip */
  function showTooltip(evt, text) {
    let elem = document.getElementById("tooltip");
    elem.querySelector(".de").innerHTML = text.de;
    elem.querySelector(".fr").innerHTML = text.fr;
    tooltip.style.display = "block";
    tooltip.style.left = evt.pageX + 10 + 'px';
    tooltip.style.top = evt.pageY + 10 + 'px';
  }
  
  function hideTooltip() {
    let tooltip = document.getElementById("tooltip");
    tooltip.style.display = "none";
  }
  
  /* helper function to make only selected lang visible */
  function setLang(lang) {
    document.querySelectorAll(".de, .fr").forEach(e=>{e.classList.add("invisible")});
    document.querySelectorAll("."+lang).forEach(e=>{e.classList.remove("invisible")});
    par.lang = lang;
  }
  
  /* read params from URL */
  function readURL() {
    let searchParams = new URLSearchParams(location.search);
  
    if (searchParams.has("code")) {
      par.code = searchParams.get("code");
    }
    parametrizeDiagrams(par.code);
  
    if (searchParams.has("lang")) {
      par.lang = searchParams.get("lang");
    }
    setLang(par.lang);
    pushURL();
  }
  
  /* Generate URL search params for the current view and push it to the window history */
  function pushURL() {
    let baseUrl = location.protocol + "//" + location.host + location.pathname;
    let searchParams = new URLSearchParams();
    searchParams.set("lang", par.lang);
    searchParams.set("code", par.code);
    let params = "?" + searchParams.toString();
    let url = baseUrl + params;
    window.history.pushState({}, window.title, url);
  }
  
  function initialize() {
    // read params from URL to initialize lang and code
    readURL();
  
    // add listener to buttons to choose a forest type
    document.querySelectorAll(".ft-button").forEach((button)=>{button.addEventListener("click", function (evt) {
      let code = evt.target.value;
      parametrizeDiagrams(code);
      pushURL();
    })});
  
    // add listener to buttons to switch language
    document.querySelectorAll(".lang-button").forEach((button)=>{button.addEventListener("click", function (evt) {
      let lang = evt.target.value;
      setLang(lang);
      pushURL();
    })});
  
    // initialize print elements
    document.getElementById("version").innerHTML = "Version 0.1";
    document.getElementById("date").innerHTML = Date().toLocaleString();
  
    // add event listener to hide tooltip
    document.querySelectorAll("rect, path").forEach((elem)=>{elem.addEventListener("mouseout", hideTooltip)});
  
    // demo open URL on #HS_C-J
    document.getElementById("HS_C-J").addEventListener("click", ()=>{open("https://tree-app.ch/?mv=14%7C735882%7C5938511&ml=azt&mp=736251%7C5939154")});
    document.getElementById("HS_C-J").style.cursor="pointer";
    
    // add event listener to share buttons
    document.getElementById("share-mailto").addEventListener("click", ()=>{open("mailto:?body="+encodeURIComponent(location.href))});
    document.getElementById("print").addEventListener("click", ()=>{print()});
  }
  
  initialize();    