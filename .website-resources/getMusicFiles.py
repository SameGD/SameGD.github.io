import os

folder = r"C:\Users\Owner\Desktop\Music"

def getFoldersEch(folderpath):
    with open("FolderNames.yml", "w+", encoding="utf-8") as f:
        for artist in os.scandir(folderpath):
            if artist.name[0] == "=":
                next

            f.write("- artist: " + artist.name + "\n")
            f.write("  albums:\n")
            for album in os.scandir(artist.path):
                f.write("    - " + album.name + "\n")


with open("FolderNames.yml", "w+", encoding="utf-8") as f:
    f.write("---\n")
    for artist in os.scandir(folder):
        if artist.name[0] == "=" or ".jpg" in artist.name:
            continue
        
        f.write('- artist: "' + artist.name + '"\n')
        f.write("  albums:\n")
        
        for root, subdirectories, files in os.walk(artist.path):
            for subdirectory in subdirectories:
                
                f.write('    - "' + subdirectory + '"\n')
                
