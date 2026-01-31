#!/usr/bin/env just --justfile

set positional-arguments := true

EDITORCONFIG_IGNORE := "node_modules|dist|coverage|\\.git"

_default:
    @just --list

[group('GIT')]
git-force:
    git push -f

alias yeet := git-force

[group('GIT')]
git-fixup hash:
    git add --all && \
    git commit --fixup='{{ hash }}' && \
    git -c sequence.editor=: rebase -i --autosquash '{{ hash }}'^

alias fixup := git-fixup

[group('APP')]
dev:
    npm run dev

[group('APP')]
build:
    npm run build

[group('TEST')]
test:
    npm run test

[group('TEST')]
coverage:
    npm test -- --coverage

[group('LINT')]
typecheck:
    vue-tsc -b

[group('LINT')]
fmt:
    vue-tsc -b
    npx eslint . --fix
    just editorconfig

[group('LINT')]
check:
    vue-tsc -b
    npx eslint . --fix
    just editorconfig
    just test

[group('LINT')]
lint:
    vue-tsc -b
    npx eslint .
    just editorconfig

[group('LINT')]
editorconfig:
    npx editorconfig-checker \
    -exclude "{{ EDITORCONFIG_IGNORE }}"

[group('DEP')]
shad-add name:
    npx shadcn-vue@latest add {{ name }}
