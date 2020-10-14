with open("cleanhobbylist.txt", "r") as inputfile:
    with open("taggedhobbylist.txt", "w+") as output:
        for line in inputfile.readlines():
            outputline = line.replace("\n", "")
            output.write("<li>" + outputline + "</li>\n")
