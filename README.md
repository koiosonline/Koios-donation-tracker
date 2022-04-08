# Nothing here yet

# Decentralized contract set-up
Use whatever tool you want to push the contract to the blockchain.


# Centralized server set-up
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
