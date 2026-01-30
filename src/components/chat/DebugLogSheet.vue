<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, } from '../ui/sheet'

defineProps<{
  gatewayLog: string[]
}>()
</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <button
          aria-label="Open debug log"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-(--ink-strong) transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
          type="button"
      >
        <Icon class="h-4 w-4" icon="mdi:bug-outline"/>
      </button>
    </SheetTrigger>
    <SheetContent class="w-full max-w-105" side="right">
      <SheetHeader>
        <SheetTitle>Gateway Debug Log</SheetTitle>
        <SheetDescription>
          Recent gateway activity for troubleshooting.
        </SheetDescription>
      </SheetHeader>
      <div
          class="mx-4 flex max-h-[calc(100vh-220px)] flex-col gap-2 overflow-y-auto text-[0.85rem] text-(--ink-muted) font-['JetBrains_Mono',ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation_Mono','Courier_New',monospace]"
      >
        <div v-if="gatewayLog.length === 0" class="text-(--ink-faint)">
          No log entries yet.
        </div>
        <div v-for="(line, index) in gatewayLog" :key="`${line}-${index}`">
          {{ line }}
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
