import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authRepository } from "../data";
import LoginPage from "./login.page";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: push }) }));
afterEach(() => { cleanup(); push.mockReset(); vi.restoreAllMocks(); });

describe("W03 login", () => {
  it("mostra o login do protótipo", () => {
    render(<LoginPage mode="login" />);
    expect(screen.getByRole("heading", { name: "Que bom te ver de novo" })).toBeTruthy();
    expect(screen.getByText("Bora começar pelo degrau mais fácil?")).toBeTruthy();
  });

  it("\"Entrar direto como Arthur (demo)\" chama o repositório de auth e vai para o Hoje", async () => {
    const demo = vi.spyOn(authRepository, "demo");
    render(<LoginPage mode="login" />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Entrar direto como Arthur (demo)" })));
    expect(demo).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith("/hoje");
  });

  it("Entrar envia e-mail e senha", async () => {
    const login = vi.spyOn(authRepository, "login");
    render(<LoginPage mode="login" />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Entrar" })));
    expect(login).toHaveBeenCalledWith({ email: "arthur@faculdade.edu.br", password: "bora1234" });
  });

  it("senha errada mostra o erro e não navega", async () => {
    render(<LoginPage mode="login" />);
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "x" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Entrar" })));
    expect(screen.getByRole("alert").textContent).toBe("E-mail ou senha inválidos");
    expect(push).not.toHaveBeenCalled();
  });
});

describe("W04 cadastro", () => {
  it("mostra o cadastro com o campo de nome", () => {
    render(<LoginPage mode="cadastro" />);
    expect(screen.getByRole("heading", { name: "Criar sua conta" })).toBeTruthy();
    expect(screen.getByLabelText("Como você quer ser chamado?")).toBeTruthy();
  });

  it("Criar conta cadastra, entra e vai para o onboarding", async () => {
    const register = vi.spyOn(authRepository, "register");
    render(<LoginPage mode="cadastro" />);
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "nova@faculdade.edu.br" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Criar conta" })));
    expect(register).toHaveBeenCalledWith(expect.objectContaining({ name: "Arthur", email: "nova@faculdade.edu.br" }));
    expect(push).toHaveBeenCalledWith("/onboarding");
  });

  it("\"Pular e ver o onboarding (demo)\" vai para o onboarding", async () => {
    render(<LoginPage mode="cadastro" />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Pular e ver o onboarding (demo)" })));
    expect(push).toHaveBeenCalledWith("/onboarding");
  });
});
