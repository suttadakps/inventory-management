"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createUserAction,
  deleteUserAction,
  resetPasswordAction,
  updateUserAction,
} from "@/lib/users/actions";
import type { ManagedUser } from "@/lib/users/repository";
import { ROLES, ROLE_LABELS, isPortalRole, type Role } from "@/lib/auth/roles";
import { ContentCard } from "@/components/ui/ContentCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Alert } from "@/components/ui/Alert";

type Option = { id: string; name: string };

const ROLE_TH: Record<Role, string> = {
  owner: "เจ้าของบริษัท",
  admin: "ผู้ดูแลระบบ",
  ae: "AE / ผู้จัดการโปรเจค",
  site_engineer: "วิศวกรหน้างาน",
  worker: "ช่าง / คนงาน",
  client: "ลูกค้า",
};

/** Six random characters is plenty for a password the office reads out loud. */
function suggestPassword(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

const inputCls =
  "h-10 w-full rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none";

function ProjectPicker({
  projects,
  selected,
  onChange,
}: {
  projects: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );

  if (projects.length === 0)
    return <p className="text-caption text-text-secondary">ยังไม่มีโปรเจค</p>;

  return (
    <div className="max-h-44 space-y-1 overflow-y-auto rounded-md border border-[#e2ddd0] bg-white p-2">
      {projects.map((p) => (
        <label
          key={p.id}
          className="flex items-center gap-2 rounded px-1.5 py-1 text-body-sm text-text-primary hover:bg-[#faf8f3]"
        >
          <input
            type="checkbox"
            checked={selected.includes(p.id)}
            onChange={() => toggle(p.id)}
            className="h-4 w-4 rounded border-border text-primary-700"
          />
          <span className="truncate">{p.name}</span>
        </label>
      ))}
    </div>
  );
}

export function UsersManager({
  users,
  projects,
  clients,
  currentUserId,
}: {
  users: ManagedUser[];
  projects: Option[];
  clients: Option[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // New-user form
  const [form, setForm] = useState({
    email: "",
    password: suggestPassword(),
    fullName: "",
    role: "worker" as Role,
    projectIds: [] as string[],
    clientId: "",
  });

  // Edit form (per row)
  const [edit, setEdit] = useState({
    fullName: "",
    role: "worker" as Role,
    projectIds: [] as string[],
    clientId: "",
  });

  const resetCreate = () =>
    setForm({
      email: "",
      password: suggestPassword(),
      fullName: "",
      role: "worker",
      projectIds: [],
      clientId: "",
    });

  const submitCreate = () => {
    setError(null);
    startTransition(async () => {
      const res = await createUserAction(form);
      if (res.ok) {
        setNotice(
          `สร้างบัญชีให้ ${form.fullName} แล้ว — อีเมล ${form.email} รหัสผ่าน ${form.password}`
        );
        resetCreate();
        setCreating(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  const startEdit = (u: ManagedUser) => {
    setEditingId(u.id);
    setError(null);
    setEdit({
      fullName: u.fullName ?? "",
      role: u.role,
      projectIds: u.projects.map((p) => p.id),
      clientId: clients.find((c) => c.name === u.clientName)?.id ?? "",
    });
  };

  const submitEdit = (userId: string) => {
    setError(null);
    startTransition(async () => {
      const res = await updateUserAction(userId, edit);
      if (res.ok) {
        setEditingId(null);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  const resetPassword = (u: ManagedUser) => {
    const next = suggestPassword();
    setError(null);
    startTransition(async () => {
      const res = await resetPasswordAction(u.id, next);
      if (res.ok) {
        setNotice(`รหัสผ่านใหม่ของ ${u.fullName ?? u.email} คือ ${next}`);
      } else {
        setError(res.error);
      }
    });
  };

  const remove = (u: ManagedUser) => {
    setError(null);
    startTransition(async () => {
      const res = await deleteUserAction(u.id);
      if (res.ok) {
        setNotice(`ลบบัญชี ${u.fullName ?? u.email} แล้ว`);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-5">
      {notice && (
        <Alert variant="success" className="text-body-sm">
          {notice}
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="ml-3 underline"
          >
            ปิด
          </button>
        </Alert>
      )}
      {error && (
        <Alert variant="error" className="text-body-sm">
          {error}
        </Alert>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setCreating((c) => !c);
            setError(null);
          }}
          className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
        >
          {creating ? "ยกเลิก" : "+ เพิ่มผู้ใช้งาน"}
        </button>
      </div>

      {creating && (
        <ContentCard className="p-5">
          <h2 className="mb-4 text-body font-semibold text-text-primary">
            เพิ่มผู้ใช้งานใหม่
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-text-primary">
                ชื่อ-นามสกุล *
              </label>
              <input
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-text-primary">
                สิทธิ์ *
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value as Role }))
                }
                className={inputCls}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_TH[r]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-text-primary">
                อีเมล (ใช้เป็นชื่อผู้ใช้) *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="somchai@artiverges.co"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-text-primary">
                รหัสผ่าน *
              </label>
              <div className="flex gap-2">
                <input
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, password: suggestPassword() }))
                  }
                  className="shrink-0 rounded-md border border-[#e2ddd0] px-3 text-body-sm text-text-primary hover:bg-[#faf8f3]"
                >
                  สุ่ม
                </button>
              </div>
            </div>

            {form.role === "client" && (
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-text-primary">
                  ผูกกับลูกค้า
                </label>
                <select
                  value={form.clientId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, clientId: e.target.value }))
                  }
                  className={inputCls}
                >
                  <option value="">— ไม่ผูก —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-caption text-text-secondary">
                  ลูกค้าจะเห็นทุกโปรเจคของบริษัทที่ผูกไว้
                </p>
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-body-sm font-medium text-text-primary">
                โปรเจคที่มอบหมาย
              </label>
              <ProjectPicker
                projects={projects}
                selected={form.projectIds}
                onChange={(next) =>
                  setForm((f) => ({ ...f, projectIds: next }))
                }
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={submitCreate}
              className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
            >
              สร้างบัญชี
            </button>
            <p className="text-caption text-text-secondary">
              จดรหัสผ่านไว้ก่อนกดสร้าง — ระบบจะแสดงอีกครั้งหลังสร้างเสร็จเท่านั้น
            </p>
          </div>
        </ContentCard>
      )}

      {users.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ยังไม่มีผู้ใช้งาน
        </div>
      ) : (
        <ContentCard className="divide-y divide-[#f0ece2]">
          {users.map((u) => {
            const portal = isPortalRole(u.role);
            const isEditing = editingId === u.id;
            return (
              <div key={u.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-body font-semibold text-text-primary">
                        {u.fullName ?? "(ไม่ระบุชื่อ)"}
                      </span>
                      <StatusBadge tone={portal ? "tan" : "navy"}>
                        {ROLE_TH[u.role]}
                      </StatusBadge>
                      {u.id === currentUserId && (
                        <StatusBadge tone="gray">คุณ</StatusBadge>
                      )}
                    </div>
                    <p className="text-caption text-text-secondary">
                      {u.email}
                      {u.clientName && ` · ลูกค้า: ${u.clientName}`}
                    </p>
                    <p className="mt-1 text-caption text-text-secondary">
                      {u.projects.length === 0
                        ? portal
                          ? "ยังไม่ได้มอบหมายโปรเจค"
                          : "เห็นทุกโปรเจค"
                        : `โปรเจค: ${u.projects.map((p) => p.name).join(", ")}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => (isEditing ? setEditingId(null) : startEdit(u))}
                      className="rounded-md border border-[#e2ddd0] px-3 py-1.5 text-body-sm text-text-primary hover:bg-[#faf8f3]"
                    >
                      {isEditing ? "ปิด" : "แก้ไข"}
                    </button>
                    <button
                      type="button"
                      onClick={() => resetPassword(u)}
                      className="rounded-md border border-[#e2ddd0] px-3 py-1.5 text-body-sm text-text-primary hover:bg-[#faf8f3]"
                    >
                      รีเซ็ตรหัสผ่าน
                    </button>
                    {u.id !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => remove(u)}
                        className="rounded-md border border-[#f0d4cf] px-3 py-1.5 text-body-sm text-danger hover:bg-[#fdf3f1]"
                      >
                        ลบ
                      </button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[#f0ece2] pt-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-body-sm font-medium text-text-primary">
                        ชื่อ-นามสกุล
                      </label>
                      <input
                        value={edit.fullName}
                        onChange={(e) =>
                          setEdit((f) => ({ ...f, fullName: e.target.value }))
                        }
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-body-sm font-medium text-text-primary">
                        สิทธิ์
                      </label>
                      <select
                        value={edit.role}
                        disabled={u.id === currentUserId}
                        onChange={(e) =>
                          setEdit((f) => ({
                            ...f,
                            role: e.target.value as Role,
                          }))
                        }
                        className={`${inputCls} disabled:bg-[#f6f3ec]`}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_TH[r]}
                          </option>
                        ))}
                      </select>
                    </div>
                    {edit.role === "client" && (
                      <div className="space-y-1.5">
                        <label className="text-body-sm font-medium text-text-primary">
                          ผูกกับลูกค้า
                        </label>
                        <select
                          value={edit.clientId}
                          onChange={(e) =>
                            setEdit((f) => ({ ...f, clientId: e.target.value }))
                          }
                          className={inputCls}
                        >
                          <option value="">— ไม่ผูก —</option>
                          {clients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-body-sm font-medium text-text-primary">
                        โปรเจคที่มอบหมาย
                      </label>
                      <ProjectPicker
                        projects={projects}
                        selected={edit.projectIds}
                        onChange={(next) =>
                          setEdit((f) => ({ ...f, projectIds: next }))
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => submitEdit(u.id)}
                        className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
                      >
                        บันทึก
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </ContentCard>
      )}

      <p className="text-caption text-text-secondary">
        ลูกค้า วิศวกรหน้างาน และช่าง จะเข้าได้เฉพาะหน้า “งานของฉัน”
        ซึ่งแสดงชื่อโปรเจค ขั้นตอนการทำงาน และรูปหน้างาน — ไม่เห็นราคา ต้นทุน
        ค่าแรง หรือเมนูอื่นใดในระบบหลังบ้าน
      </p>
    </div>
  );
}
