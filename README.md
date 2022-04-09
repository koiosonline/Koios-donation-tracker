# Nothing here yet

# Decentralized contract set-up
Install [nodejs](https://nodejs.org/en/) if you have not already done so.
Go into the contract solution directory and run the following command:
```sh
npm i
```
After this you may use whatever tool you want to push the contract to the blockchain. (e.g., [remix](remix.ethereum.org))


# Centralized server
> Setting-up or compiling requires the .env file explained in the subsection below.

## Set-up
Add a file in the ``` server_listener_solution ``` folder called ``` .env ```.
This file requires the following (replace <> with your own values):

```
provider_key=<your_provider_key>
network=<network>
donation_account=<the_donation_account>
```

Install [deno](https://deno.land) or optionally run from the executable within the root of this repository.

If you chose to manually install deno then:
```sh
deno run -A ./src/mod.ts
```

## Compiling
If you wish to compile this solution into an executable, first navigate to the root of the server based solution and then run the following command:
```sh
deno compile --output app -A ./src/mod.ts
```
After this you may proceed to run the executable in your preferred way.