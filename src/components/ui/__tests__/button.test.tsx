// components/ui/button.test.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button, buttonVariants } from '../button';

// Utilitário para checar se todas as classes esperadas estão na className final
function expectHasClasses(el: HTMLElement, classes: string) {
    for (const cls of classes.split(' ').filter(Boolean)) {
        expect(el).toHaveClass(cls);
    }
}

describe('Button', () => {
    it('renderiza com texto e data-slot', () => {
        render(<Button>Enviar</Button>);
        const btn = screen.getByText('Enviar');
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveAttribute('data-slot', 'button');
        // Deve ser um <button> quando asChild = false
        expect(btn.tagName.toLowerCase()).toBe('button');
    });

    it('aplica classes padrão de variant e size', () => {
        render(<Button>Default</Button>);
        const btn = screen.getByText('Default');
        const expected = buttonVariants({ variant: 'default', size: 'default' });
        expectHasClasses(btn, expected);
    });

    it('aplica variant "destructive" e size "lg"', () => {
        render(
            <Button variant="destructive" size="lg">
                Danger
            </Button>
        );
        const btn = screen.getByText('Danger');

        // Valide apenas o essencial do variant e size:
        expect(btn).toHaveClass('bg-destructive');
        expect(btn).toHaveClass('text-white');
        expect(btn).toHaveClass('hover:bg-destructive/90');
        expect(btn).toHaveClass('focus-visible:ring-destructive/20');

        // Size lg
        expect(btn).toHaveClass('h-10');
        expect(btn).toHaveClass('rounded-md');
        expect(btn).toHaveClass('px-6');

        // E opcionalmente, algumas classes base “estáveis” que não mudam com variant
        expect(btn).toHaveClass('inline-flex', 'items-center', 'justify-center', 'text-sm', 'font-medium');
    });

    it('mergeia className adicional com cva', () => {
        render(
            <Button className="custom-class another-one">Merge</Button>
        );
        const btn = screen.getByText('Merge');
        expect(btn).toHaveClass('custom-class');
        expect(btn).toHaveClass('another-one');
        // E continua contendo classes base do cva
        const expected = buttonVariants({ variant: 'default', size: 'default' });
        expectHasClasses(btn, expected);
    });

    it('propaga disabled corretamente', () => {
        render(<Button disabled>Disabled</Button>);
        const btn = screen.getByText('Disabled');
        expect(btn).toBeDisabled();
    });

    it('renderiza como Slot quando asChild = true', () => {
        // Simula uso com <a> como child
        render(
            <Button asChild>
                <a href="/rota">Link</a>
            </Button>
        );
        const link = screen.getByRole('link', { name: 'Link' });
        expect(link).toBeInTheDocument();
        // O data-slot e as classes devem ir para o elemento filho (Slot behavior)
        expect(link).toHaveAttribute('data-slot', 'button');
        const expected = buttonVariants({ variant: 'default', size: 'default' });
        expectHasClasses(link, expected);
    });

    it('suporta ícone svg como filho (classes utilitárias não quebram)', () => {
        render(
            <Button aria-label="com-icone">
                <svg aria-hidden="true" data-testid="icon" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8" />
                </svg>
                Com Ícone
            </Button>
        );
        const btn = screen.getByLabelText('com-icone');
        expect(btn).toBeInTheDocument();
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
});