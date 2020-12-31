import csv
import sys
from collections import defaultdict

SESSION_ID_HEADER = 'SESSION_ID'
INVIL_ID_HEADER = 'INVIL_ID'
INVIL_PW_HEADER = 'INVIL_PW'

STU_ID_HEADER = 'STU_ID'
STU_PW_HEADER = 'STU_PW'

path = sys.argv[1]
columns = defaultdict(list) # each value in each column is appended to a list

with open(path, 'r') as csv_file:
    reader = csv.DictReader(csv_file) # read rows into a dictionary format
    for row in reader: # read a row as {column1: value1, column2: value2,...}
        for (k,v) in row.items(): # go over each column name and value 
            columns[k].append(v) # append the value into the appropriate list
                                 # based on column name k


sessionId = columns[SESSION_ID_HEADER]

invilIds = columns[INVIL_ID_HEADER]
invilPws = columns[INVIL_PW_HEADER]

stuIds = columns[STU_ID_HEADER]
stuPws = columns[STU_PW_HEADER]

print(sessionId)

print(invilIds)
print(invilPws)

print(stuIds)
print(stuPws)
