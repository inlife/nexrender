# Development
## Application Stucture
![scheme](scheme.png)

## Description: 
1. Rendering node – any desktop with running instance of `noxrender.renderer`, including Web/API server. Must have Adobe After Effects installed.
2. Rendering nodes are not static, they can be added/deleted in any time. After laucning Rendering node sends api request to find any (or particular) **Project** to render.
3. Web/API server – any server/desktop with running instance of `noxrender.server`.
4. Database is local database ([lowdb](https://github.com/typicode/lowdb)) that is storing **Projects** created via noxrender.api.
5. Users may create/access/modify **Project** via `noxrender.api`, or via json REST API on `noxrender.server`.
6. Plugins is an actions that are mostly launched after rendering process is over. They run on each Rendering node. 
7. Currently only one Rendering node can render same **Project**
