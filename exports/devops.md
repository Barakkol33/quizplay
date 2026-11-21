# ⚙️ DevOps fundamentals

Linux, networking, Docker, Kubernetes and delivery. Based on the blearning DevOps guide.

*Exported for review: 2026-11-22 · id: devops · 111 questions*

> **For the reviewer:** Every question has an id. When you find a mistake, note the id and the fix. ✅ marks the correct answer.

## Subjects

1. 🐧 Linux and the command line (19 questions)
2. 🌐 Networking (20 questions)
3. 🐳 Docker (30 questions)
4. ☸️ Kubernetes (17 questions)
5. 🚀 Delivery: Git, CI/CD, deployments (25 questions)

---

## 1. 🐧 Linux and the command line

Terms, everyday commands, and reading logs with pipes

### Linux terms

*mcq · linux-terms · subjects/linux/terms.json*

#### `exit-code`

A command finished with exit code 0. What does that mean?

1. ✅ It succeeded
2. ▫️ It failed
3. ▫️ It is still running
4. ▫️ It was killed by the kernel

> **Explanation:** 0 is success, anything else is failure. Scripts and pipelines decide by the exit code.

#### `pipe`

What does the pipe | do?

1. ✅ Sends the output of one command to the input of the next
2. ▫️ Runs two commands at the same time on different CPUs
3. ▫️ Writes the output to a file
4. ▫️ Runs the next command only if the first one failed

#### `stderr`

Where does a program write its error messages?

1. ✅ stderr
2. ▫️ stdin
3. ▫️ stdout
4. ▫️ `/var/log/errors`

> **Explanation:** Programs read from stdin, write output to stdout, and errors to stderr. 2>/dev/null hides stderr.

#### `path`

What is PATH?

1. ✅ The directories the shell searches for a command
2. ▫️ The current directory
3. ▫️ The home directory of the user
4. ▫️ `The location of the shell's history file`

#### `alpine-pkg`

Alpine Linux, common in containers, installs packages with…

1. ✅ apk
2. ▫️ apt
3. ▫️ dnf
4. ▫️ brew

> **Explanation:** Ubuntu and Debian use apt, RHEL/Rocky/Fedora use dnf, Alpine uses apk.

#### `sudo`

What does sudo do?

1. ✅ Runs one command as root
2. ▫️ Switches to another shell
3. ▫️ Shows who is logged in
4. ▫️ Lists running processes

#### `everything-file`

"Everything is a file" in Linux. Which of these is shown as files under /proc?

1. ✅ Running processes
2. ▫️ Network packets in flight
3. ▫️ Installed packages
4. ▫️ DNS records

#### `count-pattern`

Which pipeline counts each distinct value in a list, biggest first?

1. ✅ `sort | uniq -c | sort -rn`
2. ▫️ `uniq | sort -n`
3. ▫️ `grep -c | sort`
4. ▫️ `wc -l | sort -r`

> **Explanation:** uniq only collapses adjacent lines, so sort first. -c counts, and sort -rn puts the biggest count on top.

#### `awk-field`

In an access log line, the status code is field 9. Which command prints only the status codes?

1. ✅ `awk '{print $9}' access.log`
2. ▫️ grep 9 access.log
3. ▫️ `cut -c 9 access.log`
4. ▫️ `head -9 access.log`

### Which command?

*typein · linux-commands · subjects/linux/commands.json*

**Instructions:** Type the command name only, without options.

#### `where-am-i`

Print the directory you are in.

**Accepted answers:** pwd

#### `follow-log`

Follow a log file in real time (with -f).

**Accepted answers:** tail · `tail -f`

#### `search-text`

Find lines that contain "error" in app.log.

**Accepted answers:** grep

#### `find-files`

Find all *.yaml files under the current directory.

**Accepted answers:** find

#### `where-binary`

Where is the kubectl binary on this machine?

**Accepted answers:** which · which kubectl · `command -v` · type

#### `count-lines`

Count the lines in a file.

**Accepted answers:** wc · `wc -l`

#### `scroll-file`

Open a big file in a scrollable viewer (q to quit).

**Accepted answers:** less · more

#### `symlink`

Create a symbolic link (with -s).

**Accepted answers:** ln · `ln -s`

> **Explanation:** ln -s /path/to/target link

### Commands and what they do

*match · linux-match · subjects/linux/match.json*

#### `grep-flags`

grep options

- `grep -i` ⟷ `Case-insensitive`
- `grep -r` ⟷ Search a directory recursively
- `grep -v` ⟷ Show lines that do NOT match
- `grep -c` ⟷ Count matching lines
- `grep -n` ⟷ Show line numbers

#### `file-ops`

File operations

- `mkdir -p a/b/c` ⟷ Create nested directories
- `cp -r src/ dst/` ⟷ Copy recursively
- mv old.txt new.txt ⟷ Move or rename
- touch file.txt ⟷ Create an empty file
- `ls -lah` ⟷ `List all files, human-readable sizes`

---

## 2. 🌐 Networking

Follow one request from the client to the server

### Networking terms

*mcq · net-terms · subjects/networking/terms.json*

#### `cidr-24`

How many addresses are in 10.0.1.0/24?

1. ✅ 256
2. ▫️ 24
3. ▫️ 65,536
4. ▫️ 16

> **Explanation:** /24 leaves 8 bits for hosts: 2⁸ = 256 addresses, 10.0.1.0 to 10.0.1.255.

#### `port-ssh`

Which port does SSH use by default?

1. ✅ 22
2. ▫️ 80
3. ▫️ 443
4. ▫️ 5432

> **Explanation:** 22 = SSH, 80 = HTTP, 443 = HTTPS, 5432 = PostgreSQL.

#### `port-postgres`

5432 is the default port of…

1. ✅ PostgreSQL
2. ▫️ Redis
3. ▫️ HTTPS
4. ▫️ SSH

#### `cname`

What does a DNS CNAME record hold?

1. ✅ An alias that points to another name
2. ▫️ An IPv4 address
3. ▫️ The mail servers of the domain
4. ▫️ Free text for domain ownership

> **Explanation:** A holds an IPv4 address, AAAA an IPv6 address, MX mail servers, TXT free text, NS who answers for the zone.

#### `ttl`

A DNS record has a long TTL. What happens when you change it?

1. ✅ The change takes long to reach everyone
2. ▫️ The change is rejected
3. ▫️ The change is instant
4. ▫️ The record is deleted after the TTL

#### `tcp-udp`

Which transport protocol is a reliable, ordered connection?

1. ✅ TCP
2. ▫️ UDP
3. ▫️ DNS
4. ▫️ ICMP

#### `nxdomain`

A DNS lookup answers NXDOMAIN. What does it mean?

1. ✅ The name does not exist
2. ▫️ The server is down
3. ▫️ The record has expired
4. ▫️ The name has no IPv6 address

#### `lb-l7`

What can a layer 7 load balancer do that a layer 4 one cannot?

1. ✅ Route by HTTP path or header
2. ▫️ Spread TCP connections
3. ▫️ Forward a port
4. ▫️ Drop traffic by source IP

> **Explanation:** Layer 4 works on TCP connections; layer 7 understands HTTP.

#### `san`

In a TLS certificate, what is the SAN?

1. ✅ The names the certificate is valid for
2. ▫️ `The certificate's expiry date`
3. ▫️ The authority that signed it
4. ▫️ `The server's private key`

### True or false

*truefalse · net-tf · subjects/networking/truefalse.json*

#### `refused-firewall`

"Connection refused" usually means a firewall dropped the traffic.

**Answer:** ❌ False

> **Explanation:** Refused means the machine answered but nothing listens on that port. A firewall that drops traffic makes the connection hang.

#### `5xx-network`

If DNS, TCP and TLS all work and the server returns 5xx, the network is fine and the application is broken.

**Answer:** ✅ True

#### `https-tls`

HTTPS is HTTP inside TLS.

**Answer:** ✅ True

#### `private-subnet`

Machines in a private subnet can reach the internet directly.

**Answer:** ❌ False

> **Explanation:** Public subnets can reach the internet directly; private ones go through NAT or not at all.

#### `dig-hosts`

dig reads /etc/hosts before asking the DNS server.

**Answer:** ❌ False

> **Explanation:** dig asks the DNS server directly. Programs use the resolver library, which also reads /etc/hosts. getent hosts shows what programs really get.

#### `bastion`

A bastion (jump host) is the one machine reachable from outside, through which you reach the private ones.

**Answer:** ✅ True

#### `drop-reject`

A firewall rule with REJECT says nothing back, while DROP answers "refused".

**Answer:** ❌ False

> **Explanation:** It is the other way around: DROP says nothing, REJECT answers refused.

### Debug a request, step by step

*order · net-order · subjects/networking/order.json*

#### `request-steps`

curl https://example.com: put the steps in the order they happen.

**Correct order:**

1. DNS: turn the name into an address
2. TCP: connect to the port
3. TLS: check who is on the other side
4. HTTP: send the request, read the status

> **Explanation:** Each step has its own tool: dig, nc -vz, openssl s_client, curl -v.

#### `tools-steps`

Put the tools in the order you would use them to debug the request.

**Correct order:**

1. `dig +short example.com`
2. `nc -vz example.com 443`
3. `openssl s_client -connect example.com:443`
4. `curl -v https://example.com`

### Which step failed?

*categorize · net-categorize · subjects/networking/categorize.json*

#### `symptoms`

A request failed. Which step is broken?

- **DNS:** dig answers NXDOMAIN · The A record points to an old server
- **TCP:** Connection refused · `nc -vz hangs: a firewall drops the traffic`
- **TLS:** The certificate expired · The certificate is for another name
- **HTTP:** The server answers 500 · The server answers 502

> **Explanation:** Follow the request: DNS, then TCP, then TLS, then HTTP. A 5xx answer means the network is fine and the application is broken.

#### `dns-records`

Which DNS record type holds this?

- **A:** `10.0.1.25` · `20.217.135.5`
- **CNAME:** `www.github.com → github.com`
- **MX:** `10 alt1.gmail-smtp-in.l.google.com`
- **NS:** `hera.ns.cloudflare.com`

---

## 3. 🐳 Docker

Images, containers, volumes, networks and Compose

### Docker in 5 minutes

*lesson · docker-lesson · subjects/docker/lesson.json*

#### `what`

**📖 What Docker does**

Docker packages an application together with everything it needs to run (the libraries, the runtime, the configuration) into one file, an **image**, and runs it as an isolated process, a **container**.

The same image runs on a laptop, in CI and in production, which ends "it works on my machine". CI builds an image, a registry stores it, and Kubernetes runs it.

#### `terms`

**📖 Five words to know**

- **Image**: a read-only package of the app and its dependencies. Built once, run many times.
- **Container**: a running instance of an image. A normal Linux process with its own view of files, network and processes.
- **Dockerfile**: the recipe an image is built from, one instruction per line. Each instruction adds a **layer**.
- **Registry**: a server that stores images: Docker Hub, ghcr.io, ECR.
- **Tag**: a movable name for an image version, like `nginx:1.27-alpine`. `latest` is only the default tag, not "the newest". A **digest** (`sha256:…`) never moves.

#### `not-vm`

**📖 Not a small virtual machine**

A VM has its own kernel on emulated hardware. A container is a process on the host's kernel that the kernel isolates:

- **Namespaces** give it its own view: process IDs, network, filesystem, host name.
- **cgroups** set limits: CPU, memory, I/O. Above its memory limit the kernel kills it: exit code **137** (`OOMKilled` in Kubernetes).
- A **layered filesystem** (OverlayFS): the image's read-only layers with a thin writable layer on top, thrown away with the container.

So a container starts in milliseconds, and anything written outside a **volume** is lost when it is removed.

#### `networking`

**📖 Ports, volumes and networks**

`-p 127.0.0.1:8088:80` forwards port 8088 on the host to port 80 in the container. Without the `127.0.0.1`, the port is open to the whole network.

A **volume** outlives the container: put database files there.

On a network you create, Docker runs a DNS server and a container's name is its host name. `localhost` inside a container is the container itself, never another container.

### Docker quiz

*mcq · docker-quiz · subjects/docker/quiz.json*

#### `image-vs-container`

What is a container?

1. ✅ A running instance of an image
2. ▫️ `A read-only package of an app`
3. ▫️ A small virtual machine with its own kernel
4. ▫️ A server that stores images

#### `exit-137`

A container exits with code 137. What happened?

1. ✅ It was killed with SIGKILL, usually for going over its memory limit
2. ▫️ The image was not found
3. ▫️ The port was already in use
4. ▫️ It finished successfully

> **Explanation:** 137 = 128 + 9: signal 9 (SIGKILL) from the kernel. In Kubernetes the same thing shows as OOMKilled.

#### `latest-tag`

What does the tag latest mean?

1. ✅ Only the default tag, not necessarily the newest
2. ▫️ Always the newest build
3. ▫️ The last image you pulled
4. ▫️ The digest of the image

#### `digest`

How is a digest (sha256:…) different from a tag?

1. ✅ It never moves: it is the ID of the content
2. ▫️ It is shorter
3. ▫️ It is only for private registries
4. ▫️ It points to the latest version

#### `limits`

Which kernel feature limits a container's CPU and memory?

1. ✅ cgroups
2. ▫️ Namespaces
3. ▫️ OverlayFS
4. ▫️ iptables

> **Explanation:** Namespaces give the container its own view; cgroups set the limits; OverlayFS gives the layered filesystem.

#### `publish-local`

-p 127.0.0.1:8088:80 publishes container port 80. Who can reach it?

1. ✅ Only this machine, on port 8088
2. ▫️ The whole network, on port 80
3. ▫️ Other containers only
4. ▫️ Nobody until you run docker expose

> **Explanation:** -p HOST:CONTAINER. Without the 127.0.0.1 in front, the port is open to the whole network.

#### `localhost-container`

Inside a container, what is localhost?

1. ✅ The container itself
2. ▫️ The host machine
3. ▫️ The first container on the network
4. ▫️ The Docker DNS server

#### `find-by-name`

On a network you created, how does one container reach another?

1. ✅ By its container name: Docker runs a DNS server
2. ▫️ Only by IP address
3. ▫️ Through localhost
4. ▫️ Only through a published port on the host

#### `lost-data`

A container wrote files outside any volume, then it was removed. The files are…

1. ✅ Gone
2. ▫️ Saved in the image
3. ▫️ Moved to a default volume
4. ▫️ Kept until the host reboots

### Container myths

*truefalse · docker-tf · subjects/docker/truefalse.json*

#### `small-vm`

A container is a small virtual machine with its own kernel.

**Answer:** ❌ False

> **Explanation:** A container is a process on the host's kernel that the kernel isolates. A VM has its own kernel on emulated hardware.

#### `shared-layers`

Many containers of the same image share its layers on disk.

**Answer:** ✅ True

#### `lives-with-process`

A container lives as long as its main process.

**Answer:** ✅ True

#### `k8s-uses-docker`

Kubernetes uses Docker itself to run containers.

**Answer:** ❌ False

> **Explanation:** Kubernetes uses containerd, but it runs exactly the images that docker build makes.

#### `copy-context`

COPY in a Dockerfile can only take files from the build context.

**Answer:** ✅ True

#### `root-safe`

Running as root inside a container is safe because the container is isolated.

**Answer:** ❌ False

> **Explanation:** All containers share one kernel. Root in a container, with the wrong settings, is close to root on the host.

#### `stop-signal`

docker stop sends SIGTERM, then SIGKILL after 10 seconds.

**Answer:** ✅ True

### Docker commands

*flashcards · docker-cards · subjects/docker/cards.json*

#### `run-throwaway`

**Front:** Start a throwaway container with a shell, deleted on exit

**Back:** docker run --rm -it alpine:3.20 sh

#### `ps-all`

**Front:** List all containers, including stopped ones

**Back:** docker ps -a

#### `logs-follow`

**Front:** Follow a container's output

**Back:** docker logs -f web

#### `exec-shell`

**Front:** Open a shell inside a running container

**Back:** docker exec -it web sh

#### `history`

**Front:** See an image's layers and how much each one added

**Back:** docker history myapp:dev

#### `inspect`

**Front:** Everything about a container as JSON: exit code, mounts, networks

**Back:** docker inspect web

#### `stats`

**Front:** CPU and memory per container, once

**Back:** docker stats --no-stream

#### `compose-down`

**Front:** Stop and remove a Compose app, and delete its volumes

**Back:** docker compose down -v

### Fill the blanks

*cloze · docker-cloze · subjects/docker/cloze.json*

#### `image-container`

A **⟦container⟧** is a running instance of an **⟦image⟧**.

**Distractors (wrong):** volume · registry

#### `limits`

**⟦Namespaces⟧** give a container its own view, and **⟦cgroups⟧** set its limits.

**Distractors (wrong):** OverlayFS · iptables

#### `oom`

Above its memory limit the kernel kills the container with exit code **⟦137⟧**.

**Distractors (wrong):** 0 · 1 · 143

#### `publish`

In -p 8088:80, **⟦8088⟧** is the port on the host and **⟦80⟧** is the port in the container.

**Distractors (wrong):** 443 · 22

#### `volume`

Data written outside a **⟦volume⟧** is lost when the container is removed.

**Distractors (wrong):** layer · tag · network

#### `digest`

A **⟦tag⟧** can move to another image, but a **⟦digest⟧** never moves.

**Distractors (wrong):** layer · label

---

## 4. ☸️ Kubernetes

The control plane, the nodes, and what happens on kubectl apply

### How Kubernetes works

*lesson · k8s-lesson · subjects/kubernetes/lesson.json*

#### `why`

**📖 Why Kubernetes**

Docker runs containers on one machine. In production you need more: if the machine crashes, the containers die with it; if traffic spikes, you need more copies fast; with 50 services you need automated deployment and networking.

Kubernetes is a **container orchestration system**. You describe the **desired state** in YAML ("run 3 copies of my app"), and it keeps working to make reality match. A crashed container is restarted; a dead node's work moves elsewhere.

#### `control-plane`

**📖 The control plane: the brain**

- **kube-apiserver**: the front door. Every kubectl command and every component talks to it.
- **etcd**: a key-value store with all cluster state.
- **kube-scheduler**: picks a node for each new Pod.
- **kube-controller-manager**: runs controllers that watch state and fix it. The Deployment controller keeps the right number of pods.

#### `nodes`

**📖 Nodes: the muscle**

- **kubelet**: the agent on each node. Makes sure its pods run, and restarts crashed containers.
- **container runtime** (usually `containerd`): actually runs the containers.
- **kube-proxy**: routes traffic for a Service to the right pods.
- **CNI plugin**: pod-to-pod networking.

#### `chain`

**📖 From a command to a running container**

1. kubectl sends the request to the **API server**.
2. The API server stores the desired state in **etcd**.
3. The **Deployment controller** creates a ReplicaSet.
4. The ReplicaSet controller creates Pod objects.
5. The **scheduler** assigns each Pod to a node.
6. The **kubelet** on that node pulls the image and starts the container.

### Architecture quiz

*mcq · k8s-quiz · subjects/kubernetes/quiz.json*

#### `declarative`

What is the core idea of Kubernetes management?

1. ✅ Declarative: describe the desired state, and Kubernetes keeps matching reality to it
2. ▫️ Imperative: run one command per change, in order
3. ▫️ Manual: an operator restarts failed containers
4. ▫️ Scheduled: changes apply once a night

#### `etcd`

Where does Kubernetes store all cluster state?

1. ✅ etcd
2. ▫️ kubelet
3. ▫️ The container registry
4. ▫️ `kube-proxy`

#### `scheduler`

A new Pod has no node yet. Which component picks one?

1. ✅ `kube-scheduler`
2. ▫️ `kube-apiserver`
3. ▫️ kubelet
4. ▫️ etcd

#### `kubelet`

Which component runs on every node and makes sure its assigned pods are running?

1. ✅ kubelet
2. ▫️ `kube-controller-manager`
3. ▫️ `kube-scheduler`
4. ▫️ kind

#### `apiserver`

Every kubectl command first talks to…

1. ✅ `kube-apiserver`
2. ▫️ etcd
3. ▫️ `The node's kubelet`
4. ▫️ The CNI plugin

#### `kube-proxy`

What does kube-proxy do?

1. ✅ Sets up rules so traffic to a Service reaches the right pods
2. ▫️ Pulls images for the kubelet
3. ▫️ Stores Secrets
4. ▫️ Exposes the cluster to the internet

#### `runtime`

Which container runtime does Kubernetes usually use?

1. ✅ containerd
2. ▫️ Docker Desktop
3. ▫️ systemd
4. ▫️ VirtualBox

#### `kind`

What is kind?

1. ✅ A tool that runs a Kubernetes cluster inside Docker containers
2. ▫️ A managed cloud Kubernetes
3. ▫️ A Kubernetes YAML linter
4. ▫️ The Kubernetes package manager

#### `readiness`

In a rolling update, what stops a broken new version from getting traffic?

1. ✅ The readiness probe
2. ▫️ The liveness probe
3. ▫️ The image tag
4. ▫️ The namespace

> **Explanation:** Traffic arrives only when the readiness probe passes. A new pod that never becomes ready stops the rollout, and the old pods keep serving.

### Components

*match · k8s-match · subjects/kubernetes/match.json*

#### `control-plane`

Control plane: match each component to its job

- `kube-apiserver` ⟷ The front door: validates every request
- etcd ⟷ `Key-value store of all cluster state`
- `kube-scheduler` ⟷ Picks a node for each new Pod
- `kube-controller-manager` ⟷ Runs controllers that reconcile state

#### `node`

Nodes: match each component to its job

- kubelet ⟷ Node agent that keeps assigned pods running
- containerd ⟷ Actually runs the containers
- `kube-proxy` ⟷ Routes Service traffic to pods
- CNI plugin ⟷ `Pod-to-pod networking`

### From kubectl to a running container

*order · k8s-order · subjects/kubernetes/order.json*

#### `create-deployment`

kubectl create deployment web --image=nginx: what happens, in order?

**Correct order:**

1. kubectl sends the request to the API server
2. The API server stores the desired state in etcd
3. The Deployment controller creates a ReplicaSet
4. The ReplicaSet controller creates Pod objects
5. The scheduler assigns each Pod to a node
6. The kubelet pulls the image and starts the container

> **Explanation:** This chain, from desired state to running container, is the heart of Kubernetes.

#### `rollout`

A rolling update with kubectl: put the commands in order.

**Correct order:**

1. `kubectl apply -f web.yaml`
2. `kubectl set image deployment/web web=nginx:1.28`
3. `kubectl rollout status deployment/web`
4. `kubectl rollout undo deployment/web`

### Select all that apply

*multi · k8s-multi · subjects/kubernetes/multi.json*

#### `control-plane`

Which components are part of the control plane?

1. ✅ `kube-apiserver`
2. ✅ etcd
3. ✅ `kube-scheduler`
4. ▫️ kubelet
5. ▫️ `kube-proxy`

> **Explanation:** kubelet and kube-proxy run on every node.

#### `node`

Which run on every node?

1. ✅ kubelet
2. ✅ container runtime
3. ✅ `kube-proxy`
4. ▫️ etcd
5. ▫️ `kube-controller-manager`

#### `solves`

Which problems does Kubernetes solve compared with Docker on one machine?

1. ✅ Restarting work on another node when a machine dies
2. ✅ Scaling to more copies
3. ✅ Rolling updates
4. ▫️ Writing the application code
5. ▫️ Choosing the programming language

#### `rollout-safe`

In a rolling update with maxUnavailable: 0 and a readiness probe, what is true?

1. ✅ Traffic reaches a new pod only when its readiness probe passes
2. ✅ A new pod that never becomes ready stops the rollout
3. ✅ The old pods keep serving meanwhile
4. ▫️ All old pods are stopped first

---

## 5. 🚀 Delivery: Git, CI/CD, deployments

From a commit to production, and back again

### Delivery quiz

*mcq · delivery-quiz · subjects/delivery/quiz.json*

#### `revert`

A bad commit reached main, a shared branch. What is the safe way to undo it?

1. ✅ git revert: a new commit that undoes it
2. ▫️ `git reset --hard and force-push`
3. ▫️ Delete the branch
4. ▫️ `git rebase -i to drop it`

> **Explanation:** Revert keeps history, so it is safe on shared branches.

#### `rebase`

What does git rebase do?

1. ✅ Replays your commits on top of another branch, rewriting them
2. ▫️ Creates a merge commit
3. ▫️ Undoes the last commit
4. ▫️ Downloads new commits

#### `pull-request`

A pull request is a feature of…

1. ✅ The hosting platform, not of Git
2. ▫️ Git itself
3. ▫️ The CI runner
4. ▫️ The container registry

#### `trunk`

Which branching model does the delivery research recommend?

1. ✅ `Trunk-based: short branches merged to main many times a day`
2. ▫️ `Git flow with long-lived develop and release branches`
3. ▫️ One branch per developer
4. ▫️ A branch per environment

#### `cd-vs-cd`

Continuous delivery vs continuous deployment: what is the difference?

1. ✅ `Delivery keeps one manual approval before release; deployment has none`
2. ▫️ `Deployment needs a manual approval; delivery does not`
3. ▫️ They are two names for the same thing
4. ▫️ Delivery is for libraries, deployment is for services

#### `build-once`

"Build once, deploy many" means…

1. ✅ `The same artifact goes through every environment; only configuration changes`
2. ▫️ Each environment builds its own image
3. ▫️ You build once a day
4. ▫️ Each developer builds locally and pushes

#### `tag-sha`

Why tag a container image with the commit hash?

1. ✅ Every running version points back to its exact code
2. ▫️ Registries require it
3. ▫️ It makes the image smaller
4. ▫️ So that latest is updated

#### `canary`

Which strategy sends a small share of traffic to the new version, then grows it?

1. ✅ Canary
2. ▫️ `Blue-green`
3. ▫️ Recreate
4. ▫️ Rolling update

#### `expand-contract`

How do you rename a database column without downtime?

1. ✅ `Expand and contract: backward-compatible steps, so old and new code both work`
2. ▫️ Rename it during a maintenance window
3. ▫️ Roll back the code if it fails
4. ▫️ Use a feature flag on the column

> **Explanation:** Code can go back in seconds. Data cannot.

### Deployment strategies

*match · delivery-match · subjects/delivery/match.json*

#### `strategies`

Match each strategy to how it works

- Recreate ⟷ Stop the old version, start the new: downtime
- Rolling update ⟷ Replace instances a few at a time
- `Blue-green` ⟷ Run both, switch all traffic at once
- Canary ⟷ A small share of traffic first, then grow it

#### `rollback-speed`

Match each strategy to its rollback

- Recreate ⟷ Slow: redeploy
- Rolling update ⟷ Medium: roll back gradually
- `Blue-green` ⟷ Instant: switch back
- Canary ⟷ Fast: shift the traffic back

#### `git-words`

Git terms

- Tag ⟷ A fixed name for one commit, used for releases
- Branch ⟷ A movable name that points at a commit
- Remote ⟷ A copy of the repository on a server
- Conflict ⟷ Two changes to the same lines

### Speed round

*truefalse · delivery-speed · subjects/delivery/speed.json*

**Instructions:** 10 seconds per question. Keys: 1 = true, 2 = false.

#### `rolling-default`

Rolling update is the default strategy in Kubernetes.

**Answer:** ✅ True

#### `blue-green-cost`

Blue-green needs double resources for a while.

**Answer:** ✅ True

#### `flags-deploy`

A feature flag turns a feature on or off without a deployment.

**Answer:** ✅ True

#### `deploy-release`

Deploy and release mean the same thing.

**Answer:** ❌ False

> **Explanation:** Deploy: the code runs in production. Release: users get the feature. Flags separate the two.

#### `long-branches`

The longer a branch lives, the easier the merge.

**Answer:** ❌ False

#### `pr-tests-only`

In the sample pipeline, a pull request runs only the tests; a merge to main also builds and pushes the image.

**Answer:** ✅ True

#### `gitignore-secrets`

.gitignore is where you list secrets you want Git to encrypt.

**Answer:** ❌ False

> **Explanation:** .gitignore lists files Git should not track at all. Secrets should never be committed.

### Fill the blanks

*cloze · delivery-cloze · subjects/delivery/cloze.json*

#### `revert`

To undo a commit on a shared branch, use git **⟦revert⟧**: it adds a new commit and keeps history.

**Distractors (wrong):** reset · rebase · stash

#### `rebase`

git **⟦rebase⟧** replays your commits on top of another branch and rewrites them.

**Distractors (wrong):** merge · revert · fetch

#### `delivery`

Continuous **⟦delivery⟧** keeps one manual approval before release; continuous **⟦deployment⟧** has none.

**Distractors (wrong):** integration · testing

#### `build-once`

Build once, deploy many: the same **⟦artifact⟧** goes through every environment, and only **⟦configuration⟧** changes.

**Distractors (wrong):** branch · runner

#### `canary`

A **⟦canary⟧** release sends a small share of traffic to the new version first.

**Distractors (wrong):** `blue-green` · recreate

#### `flags`

A feature **⟦flag⟧** separates deploy from release.

**Distractors (wrong):** tag · branch

---
