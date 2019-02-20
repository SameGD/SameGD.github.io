var TemplateContents = "";

function LoadFileTopic() {
    var oFrame = document.getElementById("TopicTemplate");
    var strRawContents = oFrame.contentWindow.document.body.childNodes[0].innerHTML;
    
    TemplateContents= strRawContents;
}

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

document.getElementById('GenerateTopicPage').onclick = function() {
                
    LoadFileTopic();
    
    //Stores the values that will be inserted into the template
    
    var pagetitle = document.getElementById("Topic").value;
    var subject = document.getElementById("Subject").value;
    var description = document.getElementById("Description").value;
    var learningobjectivesraw = document.getElementById("Objectives").value;
    
    //Generates learning objectives list
    
    var learningobjectiveslist = "";
    var count = 0;
    
    for (let objective of learningobjectivesraw.split("\n")) {
        
        learningobjectiveslist += `\t\t\t<li class="padme"><a href="#Objective${count}">${objective}</a></li>\n`;
        count += 1;
        console.log(learningobjectiveslist);
        
    };
    
    //Generates the learning objectives containers
    
    var learningobjectivescontainers = "";
    count = 0
    
    var objectivecontainer = '<div class="row container z-depth-1 scrollspy white" id="">\n\n<div class="col s12 title-row">\n\n<p class="topic-empha">Objective</p>\n\n<div class="divider"></div>\n\n</div>\n\n<div class="col s12 content-col">\n\n<p>Insert Content</p>\n\n</div>\n\n</div>\n\n'
    
    for (let objective of learningobjectivesraw.split("\n")) {
        
        learningobjectivescontainers += `\t<div class="row container z-depth-1 scrollspy white" id="Objective${count}">\n\n\t\t<div class="col s12 title-row">\n\n\t\t\t<p class="topic-empha">${objective}</p>\n\n\t\t\t<div class="divider"></div>\n\n\t\t</div>\n\n\t\t<div class="col s12 content-col">\n\n\t\t\t<p>Insert Content</p>\n\n\t\t</div>\n\n\t</div>\n\n`;
        
        count += 1;
        
        console.log(learningobjectivescontainers);
        
    };
    
    TemplateContents = TemplateContents.replaceAll("${pagetitle}", pagetitle);
    TemplateContents = TemplateContents.replaceAll("${subject}", subject);
    TemplateContents = TemplateContents.replaceAll("${description}", description);
    TemplateContents = TemplateContents.replaceAll("${learningobjectiveslist}", learningobjectiveslist);
    TemplateContents = TemplateContents.replaceAll("${learningobjectivecontainers}", learningobjectivescontainers);
    TemplateContents = TemplateContents.replaceAll("&lt;", "<",);
    TemplateContents = TemplateContents.replaceAll("&gt;", ">");
    
    
    document.getElementById("Output").value = TemplateContents;
    
    M.textareaAutoResize(document.getElementById("Output"));
};