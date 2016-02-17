# Development
## Description
To explain in simple words, what this library does is, ill show you this simple algorythm:
 
1. You create your AE project in your After Effects application
2. You copy this project on machine that will be  a rendering node.
3. Somewhere on this or on the other machine you launch a Api server
3. You create new request for render via api or via rest called **Project**
4. Project information got saved into api database
5. After a while render node queries api server and gets a fresh project object
6. Rendering node downloads assets provided with project, copies AE project file, puts assets nearby and starts rendering process
6. Api client gets notified when rendering started
7. Rendering node fininishes rendering and starts post rendering tasks (it may be upload on youtube, etc.)
8. Rendering node cleans up working directory and finishes project. Then it's trying to get new project, and so on.


This "library" or application does not render video by itself. To render AE project you need actual AE application installed on machine that will be used as rendering node (`renderer`).

## Application Stucture
![scheme](https://cloud.githubusercontent.com/assets/2182108/13123764/84efaf94-d5c6-11e5-9517-69f940bfadbc.png)

## Terms:
1. Rendering node – any desktop with running instance of `nexrender.renderer`, including Web/API server. Must have Adobe After Effects installed.
2. Rendering nodes are not static, they can be added/deleted in any time. After laucning Rendering node sends api request to find any (or particular) **Project** to render.
3. Web/API server – any server/desktop with running instance of `nexrender.server`.
4. Database is local database ([lowdb](https://github.com/typicode/lowdb)) that is storing **Projects** created via nexrender.api.
5. Users may create/access/modify **Project** via `nexrender.api`, or via json REST API on `nexrender.server`.
6. Plugins is an actions that are mostly launched after rendering process is over. They run on each Rendering node. 
7. Currently only one Rendering node can render same **Project**
