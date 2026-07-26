# ALDE Self-hosted Runner Bridge

This bridge lets GitHub Actions request Alpha-Tech Local Development Engine (ALDE) certification on the designated Windows development machine.

## Security boundary

- The workflow is manual (`workflow_dispatch`) only.
- The job requires the custom runner label `alpha-tech-local`.
- The wrapper accepts only `Certify` or `SyncAndCertify`.
- No arbitrary shell command is accepted from workflow inputs.
- ALDE remains responsible for clean-tree, branch, repository, runtime, and publication guards.
- Only ALDE JSON evidence is copied to the workflow workspace and uploaded.
- `.env`, source files, databases, and general artifact directories are not uploaded.

## Required local repositories

```text
D:\alpha-tech\client
D:\alpha-tech\server
```

Both repositories must:

- be Git repositories;
- contain `package.json`;
- use the `main` branch;
- have an `origin` remote;
- be clean before synchronization and certification.

## One-time GitHub runner registration

Open the private client repository in GitHub:

```text
Settings → Actions → Runners → New self-hosted runner
```

Choose **Windows** and **x64**, then run the registration commands GitHub provides on the Alpha-Tech machine.

During configuration, assign this additional label:

```text
alpha-tech-local
```

A recommended installation location is:

```text
C:\actions-runner
```

After registration, either run it interactively with:

```powershell
cd C:\actions-runner
.\run.cmd
```

or install it as a Windows service using the service commands shown by the GitHub runner setup.

The runner must show:

```text
Connected to GitHub
Listening for Jobs
```

## Triggering certification

Open:

```text
Actions → ALDE Local Certification → Run workflow
```

Modes:

- `SyncAndCertify` — recommended. Fast-forward synchronizes both local repositories from `origin/main`, then runs certification.
- `Certify` — certifies the exact clean local `main` checkouts without pulling first.

The workflow executes:

```powershell
D:\alpha-tech\client\local-build.ps1 `
  -Mode SyncAndCertify `
  -ClientPath D:\alpha-tech\client `
  -ServerPath D:\alpha-tech\server `
  -RemoteName origin `
  -RequiredBranch main `
  -RunAllBackendVerifiers `
  -IncludeRuntime
```

## Evidence

Every run uploads one artifact named approximately:

```text
alde-local-certification-<run-id>
```

It contains:

- the ALDE verification report generated during that run;
- `runner-result.json` with status, timestamps, runner identity, client/server commit SHAs, and exit code.

The GitHub Actions job summary also records PASS/FAIL and both certified commit SHAs.

## Important operational rule

The self-hosted runner executes software from the repository on the local machine. Keep this workflow restricted to the private trusted repository and do not enable untrusted pull-request workflows on this runner.
