var TemplateContents = "";

function LoadFileDef() {
    var oFrame = document.getElementById("DefinitionsTemplate");
    var strRawContents = oFrame.contentWindow.document.body.childNodes[0].innerHTML;
    TemplateContents= strRawContents;
}

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var RowCount = 0;

function NewRow() {
    
    document.getElementById(`Word${RowCount}`).setAttribute("oninput", "");
    
    RowCount += 1;
    
    document.getElementById("DefinitionsRow").insertAdjacentHTML("beforeend", `<div class="col s2 input-field"><input id="Word${RowCount}" type="text" oninput="NewRow()"><label for="Word${RowCount}">Word</label></div><div class="col s10 input-field"><textarea class="materialize-textarea" id="Definition${RowCount}" type="text"></textarea><label for="Definition${RowCount}">Definition</label></div>`);
    
    M.updateTextFields();
    
}

function GetWordsDefinitions() {
    
    var WordDefinitionArray = [];
    var DefinitionsRow = document.getElementById("DefinitionsRow");
    
    //Gets each of the inputted words
    
    for (WordInput of DefinitionsRow.getElementsByTagName("input")) {
        
        WordDefinitionArray.push([WordInput.value]);
        
    }
    
    var count = 0;
    
    for (DefinitionsInput of DefinitionsRow.getElementsByTagName("textarea")) {
        
        WordDefinitionArray[count].push(DefinitionsInput);
        count += 1;
        
    }
    
    //Get rid of empty inputs at bottom
    
    WordDefinitionArray.pop();
    
    return WordDefinitionArray;
    
}

function AutofillDefinitions() {

    var WordDefinitionArray = GetWordsDefinitions();
    
    for (Pair of WordDefinitionArray) {

        GetDefinition(Pair);

    }
    
}

async function GetDefinition(Pair) {
    
    //Uses the Datamuse api to get the definition of the current word
    
    fetch(`https://api.datamuse.com/words?sp=${Pair[0].replaceAll(" ","+")}&topics=${document.getElementById("DefinitionsTopicr").value}&md=d&max=2`).then(response => {

        return response.json();

    }).then(data => {
        // Work with JSON data here

        Pair[1].value = (data["0"].defs["0"].replace("n	", "").replace("adj	", "").replace("v	", "") + ".").capitalize();
        M.textareaAutoResize(Pair[1]);
        M.updateTextFields();

    }).catch(err => {

        // Do something for an error here
        console.log("AHHHHHH");

    });
    
}

document.getElementById('GenerateDefinitions').onclick = function() {
    
    var WordDefinitionArray = GetWordsDefinitions();
    
    var DefinitionsList = "";
    var DefinitionsContainers = "";
    var Count = 0;
    
    for (Pair of WordDefinitionArray) {
        
        //Makes the list of words for the definitions container
        
        if (Count == 0) {
            
            DefinitionsList += `\t\t\t\t<li class='tab active'><a href='#Def${Count}'>${Pair[0]}</a></li>\n\n`;
            
        } else {
            
            DefinitionsList += `\t\t\t\t<li class='tab'><a href='#Def${Count}'>${Pair[0]}</a></li>\n\n`;
            
        }
        
        //Makes the containers that contain the word and definition
        
        DefinitionsContainers += `\t\t\t<div id="Def${Count}" class="tab-content">\n\n\t\t\t\t<p class="DefinitionWord accent-left">${Pair[0]}</p>\n\n\t\t\t\t<p class="DefinitionContent">${Pair[1].value}</p>\n\n\t\t\t\t<br>\n\n\t\t\t</div>\n\n`;
        
        Count += 1;
        
    }
    
    LoadFileDef()
    
    TemplateContents = TemplateContents.replaceAll("${definitionslist}", DefinitionsList);
    TemplateContents = TemplateContents.replaceAll("${definitionscontainers}", DefinitionsContainers);
    TemplateContents = TemplateContents.replaceAll("&lt;", "<",);
    TemplateContents = TemplateContents.replaceAll("&gt;", ">");
    
    document.getElementById("Output").value = TemplateContents;
    
    M.textareaAutoResize(document.getElementById("Output"));
    
}












