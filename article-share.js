import {
  Check,
  Link,
  MessageCircle,
  Printer,
  Send,
  Share2,
  UsersRound,
  createElement as createLucideElement
} from "lucide";
import "./article-share.css";

const shareIcons = {
  check: Check,
  link: Link,
  message: MessageCircle,
  print: Printer,
  send: Send,
  share: Share2,
  users: UsersRound
};

function hydrateShareIcons(toolbar) {
  toolbar.querySelectorAll("[data-article-share-icon]:not([data-icon-ready])").forEach((host) => {
    const icon = shareIcons[host.dataset.articleShareIcon];
    if (!icon) return;
    host.dataset.iconReady = "true";
    host.replaceChildren(createLucideElement(icon, {
      "aria-hidden": "true",
      focusable: "false",
      stroke: "currentColor",
      "stroke-width": 2.2
    }));
  });
}

function shareUrl(toolbar) {
  const configured = String(toolbar.dataset.shareUrl || "").trim();
  const canonical = document.querySelector('link[rel="canonical"]')?.href || "";
  const current = new URL(window.location.href);
  current.hash = "";
  current.search = "";
  const isArticlePath = (value) => /\/(article|care-story|master-talk)\//.test(value);
  if (isArticlePath(canonical)) return canonical;
  if (isArticlePath(current.pathname)) return current.href;
  return configured || current.href;
}

function setShareStatus(toolbar, message, state = "success") {
  const status = toolbar.querySelector(".article-share-status");
  if (!status) return;
  window.clearTimeout(Number(status.dataset.clearTimer || 0));
  status.textContent = message;
  status.dataset.state = state;
  status.hidden = !message;
  if (!message) return;
  status.dataset.clearTimer = String(window.setTimeout(() => {
    status.hidden = true;
    status.textContent = "";
  }, 6000));
}

function dispatchShareAnalytics(toolbar, channel) {
  if (!Array.isArray(window.dataLayer)) return;
  window.dataLayer.push({
    event: "article_share",
    article_share_channel: channel,
    article_share_title: toolbar.dataset.shareTitle || document.title,
    article_share_url: shareUrl(toolbar)
  });
}

async function copyShareUrl(toolbar) {
  const url = shareUrl(toolbar);
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(url);
      return;
    } catch {
      // Some browsers expose Clipboard API but deny it; continue with the selection fallback.
    }
  }
  const input = document.createElement("textarea");
  input.value = url;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.focus({ preventScroll: true });
  input.select();
  input.setSelectionRange(0, input.value.length);
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Copy command unavailable");
}

function hydrateShareToolbar(toolbar) {
  if (!(toolbar instanceof HTMLElement)) return;
  if (!toolbar.querySelector(".article-share-intro")) {
    toolbar.innerHTML = `
      <div class="article-share-intro">
        <span data-article-share-icon="share" aria-hidden="true"></span>
        <span><strong>分享這篇文章</strong><small>把實用資訊傳給家人</small></span>
      </div>
      <div class="article-share-actions">
        <button type="button" data-article-share-command="native" hidden>
          <span data-article-share-icon="send" aria-hidden="true"></span><span>分享</span>
        </button>
        <a class="article-share-line" target="_blank" rel="noopener noreferrer" data-article-share-command="line">
          <span data-article-share-icon="message" aria-hidden="true"></span><span>LINE</span>
        </a>
        <a class="article-share-facebook" target="_blank" rel="noopener noreferrer" data-article-share-command="facebook">
          <span data-article-share-icon="users" aria-hidden="true"></span><span>Facebook</span>
        </a>
        <button type="button" data-article-share-command="copy">
          <span data-article-share-icon="link" aria-hidden="true"></span><span>複製連結</span>
        </button>
        <button type="button" data-article-share-command="print">
          <span data-article-share-icon="print" aria-hidden="true"></span><span>列印</span>
        </button>
      </div>
      <p class="article-share-status" role="status" aria-live="polite" hidden></p>
    `;
  }
  hydrateShareIcons(toolbar);

  const url = shareUrl(toolbar);
  const lineLink = toolbar.querySelector('[data-article-share-command="line"]');
  const facebookLink = toolbar.querySelector('[data-article-share-command="facebook"]');
  if (lineLink) lineLink.href = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
  if (facebookLink) facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const nativeButton = toolbar.querySelector('[data-article-share-command="native"]');
  if (nativeButton) nativeButton.hidden = typeof navigator.share !== "function";
}

function ensureShareToolbars(root = document) {
  root.querySelectorAll?.(".article-main").forEach((main) => {
    const meta = main.querySelector(".article-meta");
    if (!meta || main.querySelector("[data-article-share]")) return;
    const toolbar = document.createElement("section");
    toolbar.className = "article-share-toolbar";
    toolbar.dataset.articleShare = "";
    toolbar.dataset.shareTitle = main.querySelector("h1")?.textContent?.trim()
      || document.querySelector(".article-hero h1")?.textContent?.trim()
      || document.title;
    toolbar.setAttribute("aria-label", "分享這篇文章");
    meta.insertAdjacentElement("afterend", toolbar);
  });
}

function hydrateShareToolbars(root = document) {
  ensureShareToolbars(root);
  root.querySelectorAll?.("[data-article-share]").forEach(hydrateShareToolbar);
}

async function handleShareAction(event) {
  const control = event.target.closest("[data-article-share-command]");
  const toolbar = control?.closest("[data-article-share]");
  if (!control || !toolbar) return;

  const channel = control.dataset.articleShareCommand;
  if (control.tagName === "A") {
    dispatchShareAnalytics(toolbar, channel);
    return;
  }

  event.preventDefault();
  if (channel === "native") {
    try {
      await navigator.share({
        title: toolbar.dataset.shareTitle || document.title,
        text: "這篇歲悅長照文章很實用，分享給你。",
        url: shareUrl(toolbar)
      });
      dispatchShareAnalytics(toolbar, channel);
    } catch (error) {
      if (error?.name !== "AbortError") setShareStatus(toolbar, "目前無法開啟分享選單，請改用複製連結。", "error");
    }
    return;
  }

  if (channel === "copy") {
    try {
      await copyShareUrl(toolbar);
      const iconHost = control.querySelector("[data-article-share-icon]");
      if (iconHost) {
        iconHost.dataset.articleShareIcon = "check";
        delete iconHost.dataset.iconReady;
        hydrateShareIcons(toolbar);
      }
      setShareStatus(toolbar, "文章連結已複製，可以貼給家人了。");
      dispatchShareAnalytics(toolbar, channel);
      window.setTimeout(() => {
        if (!iconHost?.isConnected) return;
        iconHost.dataset.articleShareIcon = "link";
        delete iconHost.dataset.iconReady;
        hydrateShareIcons(toolbar);
      }, 2200);
    } catch {
      setShareStatus(toolbar, "無法自動複製，請直接複製瀏覽器網址。", "error");
    }
    return;
  }

  if (channel === "print") {
    dispatchShareAnalytics(toolbar, channel);
    window.print();
  }
}

export function initArticleShare() {
  if (document.documentElement.dataset.articleShareReady === "true") {
    hydrateShareToolbars();
    return;
  }
  document.documentElement.dataset.articleShareReady = "true";
  hydrateShareToolbars();
  document.addEventListener("click", handleShareAction);

  const pageView = document.querySelector("#pageView");
  if (!pageView) return;
  const observer = new MutationObserver(() => hydrateShareToolbars(pageView));
  observer.observe(pageView, { childList: true, subtree: true });
}
