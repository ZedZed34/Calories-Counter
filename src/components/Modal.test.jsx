import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

describe('Modal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
  });

  afterEach(() => {
    // Ensure body overflow is restored
    document.body.style.overflow = '';
  });

  describe('when closed (isOpen=false)', () => {
    it('renders nothing', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={onClose}>
          <p>Modal content</p>
        </Modal>
      );

      expect(container.firstChild).toBeNull();
    });

    it('does not lock body scroll', () => {
      render(
        <Modal isOpen={false} onClose={onClose}>
          <p>Modal content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('when open (isOpen=true)', () => {
    it('renders children', () => {
      render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Modal content</p>
        </Modal>
      );

      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('renders the close button', () => {
      render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Got it')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      await user.click(screen.getByText('Got it'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      await user.click(screen.getByText('Content').closest('.modal-overlay'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does NOT call onClose when modal content is clicked (stopPropagation)', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      await user.click(screen.getByText('Content'));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('locks body scroll when open', () => {
      render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when closed', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal isOpen={false} onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('');
    });

    it('calls onClose on Escape key', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on Escape when closed', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen={false} onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(onClose).not.toHaveBeenCalled();
    });

    it('renders accent bar and body structure', () => {
      render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      const modalContent = screen.getByText('Content').closest('.modal-content');
      expect(modalContent).toBeInTheDocument();

      const accentBar = modalContent.querySelector('.modal-accent-bar');
      expect(accentBar).toBeInTheDocument();

      const modalBody = modalContent.querySelector('.modal-body');
      expect(modalBody).toBeInTheDocument();
    });

    it('cleans up body scroll on unmount', () => {
      document.body.style.overflow = '';

      const { unmount } = render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('');
    });
  });
});
