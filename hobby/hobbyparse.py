with open("hobbylist.txt", "r") as inputfile:
    with open("cleanhobbylist.txt", "w+") as output:
        for line in inputfile.readlines():
            if line[0] == "*":
                outputline = line.split("]]")[0]
                output.write(outputline[4:] + "\n")
