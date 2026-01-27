#!/usr/bin/env just --justfile

set positional-arguments := true

[group('GIT')]
git-force:
    git push -f

alias yeet := git-force

git-fixup hash:
    git add --all && \
    git commit --fixup='{{ hash }}' && \
    git -c sequence.editor=: rebase -i --autosquash '{{ hash }}'^

alias fixup := git-fixup
