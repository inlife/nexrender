# Development
## Application Stucture
![scheme](https://cloud.githubusercontent.com/assets/2182108/13123764/84efaf94-d5c6-11e5-9517-69f940bfadbc.png)

## Description: 
1. Rendering node – any desktop with running instance of `nexrender.renderer`, including Web/API server. Must have Adobe After Effects installed.
2. Rendering nodes are not static, they can be added/deleted in any time. After laucning Rendering node sends api request to find any (or particular) **Project** to render.
3. Web/API server – any server/desktop with running instance of `nexrender.server`.
4. Database is local database ([lowdb](https://github.com/typicode/lowdb)) that is storing **Projects** created via nexrender.api.
5. Users may create/access/modify **Project** via `nexrender.api`, or via json REST API on `nexrender.server`.
6. Plugins is an actions that are mostly launched after rendering process is over. They run on each Rendering node. 
7. Currently only one Rendering node can render same **Project**
