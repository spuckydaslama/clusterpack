# Clusterpack
A Dashboard for some workload types (currently Deployments and StatefulSets) and their status + deployed image tags.
![image](https://github.com/spuckydaslama/clusterpack/assets/1006474/32bc1bae-d906-49fe-b70f-d0cc85f187f5)


## How to use it
Download the kube-config file from you cluster manager (one cluster/user per file) and drop and upload it.
Once it's parsed you can navigate to a cluster.
![image](https://github.com/spuckydaslama/clusterpack/assets/1006474/dd0172fb-5ea3-4b86-a54b-437514546f43)



## Security
- all infos (like the most important one - the kube-configs) are stored only in local storage.
 - If you clear it, it's gone - you have to reupload it.
- nothing is stored server side
- no cookies - i don't track poeple


## Developing

```bash
npm i
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
