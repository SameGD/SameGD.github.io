with open("AbandonedVictorianSchools.txt", "r") as inputfile:
    with open("ParserOutput.txt", "w+") as output:
        for line in inputfile.readlines():
            outputline = line.replace("\n", "")
            fate = input("Fate of " + outputline + "?: ")
            status = input("Is " + outputline + " visitable?: ")
            output.write('- name: {}\n  fate: {}\n  visitable: {}\n'.format(outputline, fate, status))
