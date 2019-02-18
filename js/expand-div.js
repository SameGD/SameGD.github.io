var Button = document.getElementById("toggleExpand");

function toggleExpand() {
    
    if (this.parentElement.parentElement.parentElement.className.includes("fat-container")) {
        
        this.parentElement.parentElement.parentElement.className = this.parentElement.parentElement.parentElement.className.replace("fat-container", "container");
        
    } else{
        
        this.parentElement.parentElement.parentElement.className = this.parentElement.parentElement.parentElement.className.replace("container", "fat-container");
        
    }
    
};