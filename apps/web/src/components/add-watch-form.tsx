"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWatchSchema } from "@pricewatch/schemas";
import { createWatch, watchKeys } from "@/lib/api";
import type { WatchDTO } from "@/lib/types";

export function AddWatchForm() {
    const queryClient = useQueryClient();
    const [errors, setErrors] = useState<string[]>([]);

    const mutation = useMutation({
        mutationFn: createWatch,

        // Runs BEFORE the request is sent.
        onMutate: async (input) => {
            // 1. Stop any in-flight refetch of the list. Otherwise a poll that
            //    started a moment ago could land after this and wipe out the
            //    optimistic item.
            await queryClient.cancelQueries({ queryKey: watchKeys.all });

            // 2. Snapshot the current list so we can roll back.
            const previous = queryClient.getQueryData<WatchDTO[]>(watchKeys.all);

            // 3. Insert a fake watch immediately. The "temp-" id is how
            //    WatchList knows to render it greyed out.
            const now = new Date().toISOString();
            const optimistic: WatchDTO = {
                ...input,
                id: `temp-${crypto.randomUUID()}`,
                status: "active",
                nextCheckAt: now,
                createdAt: now,
            };
            queryClient.setQueryData<WatchDTO[]>(watchKeys.all, (old = []) => [
                optimistic,
                ...old,
            ]);

            // 4. Whatever we return here is passed to onError as the 3rd arg.
            return { previous };
        },

        onError: (err, _input, context) => {
            // → your turn: roll the cache back to the snapshot.
            // (one line — answer at the bottom of this file)
            queryClient.setQueryData(watchKeys.all, context?.previous);
            setErrors([err.message]);
        },

        // Runs after success OR failure. Refetch the real list either way,
        // so the temp item is replaced with the server's version.
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: watchKeys.all });
        },
    });

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);

        // The SAME schema the API route uses. This is the Session 2
        // payoff: one definition, validated in the browser and the server.
        const parsed = createWatchSchema.safeParse({
            url: fd.get("url"),
            label: fd.get("label"),
            targetPrice: Number(fd.get("targetPrice")),
            currency: fd.get("currency"),
            checkIntervalMinutes: Number(fd.get("checkIntervalMinutes")),
        });

        if (!parsed.success) {
            setErrors(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
            return;
        }

        setErrors([]);
        mutation.mutate(parsed.data);
        form.reset();
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.5rem", marginBottom: "2rem" }}>
            <input name="url" type="url" placeholder="Product URL" required />
            <input name="label" placeholder="Label" required />
            <input name="targetPrice" type="number" step="0.01" placeholder="Target price" required />
            <select name="currency" defaultValue="INR">
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
            </select>
            <input name="checkIntervalMinutes" type="number" defaultValue={360} required />
            <button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Adding…" : "Add watch"}
            </button>
            {errors.map((msg) => (
                <p key={msg} style={{ color: "red", margin: 0 }}>{msg}</p>
            ))}
        </form>
    );
}