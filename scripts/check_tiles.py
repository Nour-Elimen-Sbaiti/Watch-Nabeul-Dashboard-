import math, subprocess
lat=36.45; lon=10.73; z=9
n=2**z
x=int((lon+180.0)/360.0*n)
lat_rad=math.radians(lat)
y=int((1.0 - math.log(math.tan(lat_rad) + 1.0/math.cos(lat_rad))/math.pi)/2.0 * n)
print('z',z,'x',x,'y',y)
for layer in [1,2,3,4]:
    url=f'http://127.0.0.1:8000/tiles/{layer}/{z}/{x}/{y}.png'
    print('\nURL ->',url)
    try:
        p=subprocess.run(['curl.exe','-I',url], capture_output=True, text=True, timeout=15)
        print(p.stdout)
    except Exception as e:
        print('curl failed',e)
