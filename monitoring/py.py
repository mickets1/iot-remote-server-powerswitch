import json
import psutil
 
def getData():
    #cpu load
    #print(psutil.cpu_percent(1))

    # cores
    #print(psutil.cpu_count())

    # free memory
    #print(psutil.virtual_memory().percent)

    #free disk space
    #print(psutil.disk_usage('/').percent)

    #cpu
    #print(psutil.sensors_temperatures()['acpitz'][0].current)

    #gpu
    #print(psutil.sensors_temperatures()['pch_skylake'][0].current)

    data = {
        'cores': psutil.cpu_count(),
        'cpuLoad': psutil.cpu_percent(1),
        'freeMem': psutil.disk_usage('/').percent,
        'freeDisk': psutil.disk_usage('/').percent,
        'cpuTemp': psutil.sensors_temperatures()['acpitz'][0].current,
        'gpuTemp': psutil.sensors_temperatures()['pch_skylake'][0].current
    }
    
    return json.dumps(data)
