
# coding: utf-8

# In[144]:

import requests
import pandas as pd
from StringIO import StringIO
from numpy import mean, float64
import psycopg2


# In[92]:

r = requests.get('http://www.sos.state.mn.us/Modules/ShowDocument.aspx', params={'documentid':14542})
data = pd.read_excel(StringIO(r.content))


# In[102]:

def get_dfl_topballot_mean(precinct):
    topballot_h2h = [[x+'DFL', x+'R'] for x in ['USSEN', 'MNGOV', 'MNSOS', 'MNAG', 'MNAUD']]
    return mean([float(precinct[y[0]]) / (precinct[y[0]] + precinct[y[1]]) if (precinct[y[0]] + precinct[y[1]]) > 0 else 0 for y in topballot_h2h])


data['dfl_topballot_margin_mean'] = data.apply(lambda x: get_dfl_topballot_mean(x), axis=1)
data['dfl_house_margin'] = data.apply(lambda x: float(x['MNLEGDFL']) / (x['MNLEGDFL'] + x['MNLEGR']) if x['MNLEGDFL'] > 0 else 0, axis=1)


# In[146]:

db = psycopg2.connect('user=postgres')
cursor = db.cursor()
def get_precinct_area(x):
    query = "select sum(ST_Area(geom)) from mn_geo.vtd2014general where vtdid = '%d' group by vtdid;" % x
    cursor.execute(query)
    return cursor.fetchone()[0]
data['precinct_area'] = data['VTDID'].apply(lambda x: get_precinct_area(x))
cursor.close()
db.close()


# In[164]:

data['votes_area'] = data[['TOTVOTING', 'precinct_area']].apply(lambda x: x[0] / x[1], axis=1)
data['votes_area'] = data['votes_area'] / data['votes_area'].max().astype(float64)


# In[179]:

output = data[['VTDID', 'PCTNAME', 'MNLEGDIST', 'TOTVOTING', 'dfl_topballot_margin_mean', 'dfl_house_margin', 'votes_area']]

output.columns = ['VTD', 'PrecinctName', 'HD', 'tot14', 'stw14', 'sth14', 'votes_area']

output.to_csv('data.csv', index=False, float_format='%.6f')


# In[ ]:



