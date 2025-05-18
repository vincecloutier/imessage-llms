// Path: components/ui/credenza.tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

interface BaseProps {
  children: React.ReactNode
}

interface RootCredenzaProps extends BaseProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  preventClose?: boolean // New prop
}

interface CredenzaProps extends BaseProps {
  className?: string
  asChild?: true
  showCloseButton?: boolean 
}

// Update Context to include preventClose
const CredenzaContext = React.createContext<{ isDesktop: boolean; preventClose: boolean }>({
  isDesktop: false,
  preventClose: false,
});

const useCredenzaContext = () => {
  const context = React.useContext(CredenzaContext);
  if (!context) {
    throw new Error(
      "Credenza components cannot be rendered outside the Credenza Context",
    );
  }
  return context;
};

const Credenza = ({ children, preventClose = false, ...props }: RootCredenzaProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const CurrentCredenza = isDesktop ? Dialog : Drawer;

  return (
    <CredenzaContext.Provider value={{ isDesktop, preventClose }}>
      <CurrentCredenza
        {...props}
        {...(!isDesktop && {
          autoFocus: true,
          // For Drawer (vaul), set dismissible based on preventClose
          dismissible: !preventClose,
        })}
      >
        {children}
      </CurrentCredenza>
    </CredenzaContext.Provider>
  );
};


const CredenzaTrigger = ({ className, children, ...props }: CredenzaProps) => {
  const { isDesktop } = useCredenzaContext();
  const CurrentCredenzaTrigger = isDesktop ? DialogTrigger : DrawerTrigger;

  return (
    <CurrentCredenzaTrigger className={className} {...props}>
      {children}
    </CurrentCredenzaTrigger>
  );
};

const CredenzaClose = ({ className, children, ...props }: CredenzaProps) => {
  const { isDesktop, preventClose } = useCredenzaContext();

  if (preventClose) {
    return null; // Don't render if closing is prevented
  }

  const CurrentCredenzaClose = isDesktop ? DialogClose : DrawerClose;

  return (
    <CurrentCredenzaClose className={className} {...props}>
      {children}
    </CurrentCredenzaClose>
  );
};

const CredenzaContent = ({ className, children, showCloseButton = true, ...props }: CredenzaProps) => {
  const { isDesktop, preventClose } = useCredenzaContext();

  if (isDesktop) {
    return (
      <DialogContent
        className={className}
        showCloseButton={showCloseButton}
        onEscapeKeyDown={(e) => {
          if (preventClose) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if (preventClose) {
            e.preventDefault();
          }
        }}
        {...props}
      >
        {children}
      </DialogContent>
    );
  }

  return (
    <DrawerContent className={className} {...props}>
      {children}
    </DrawerContent>
  );
};

const CredenzaDescription = ({
  className,
  children,
  ...props
}: CredenzaProps) => {
  const { isDesktop, preventClose } = useCredenzaContext(); // preventClose consumed for context consistency
  const CurrentCredenzaDescription = isDesktop ? DialogDescription : DrawerDescription;

  return (
    <CurrentCredenzaDescription className={className} {...props}>
      {children}
    </CurrentCredenzaDescription>
  );
};

const CredenzaHeader = ({ className, children, ...props }: CredenzaProps) => {
  const { isDesktop, preventClose } = useCredenzaContext(); // preventClose consumed for context consistency
  const CurrentCredenzaHeader = isDesktop ? DialogHeader : DrawerHeader;

  return (
    <CurrentCredenzaHeader className={className} {...props}>
      {children}
    </CurrentCredenzaHeader>
  );
};

const CredenzaTitle = ({ className, children, ...props }: CredenzaProps) => {
  const { isDesktop, preventClose } = useCredenzaContext(); // preventClose consumed for context consistency
  const CurrentCredenzaTitle = isDesktop ? DialogTitle : DrawerTitle;

  return (
    <CurrentCredenzaTitle className={className} {...props}>
      {children}
    </CurrentCredenzaTitle>
  );
};

const CredenzaBody = ({ className, children, ...props }: CredenzaProps) => {
  const { isDesktop } = useCredenzaContext();
  const bodyClasses = !isDesktop ? "flex-1 overflow-y-auto" : "";
  return (
    <div className={cn("px-4 md:px-0", bodyClasses, className)} {...props}>
      {children}
    </div>
  );
};

const CredenzaFooter = ({ className, children, ...props }: CredenzaProps) => {
  const { isDesktop, preventClose } = useCredenzaContext(); // preventClose consumed for context consistency
  const CurrentCredenzaFooter = isDesktop ? DialogFooter : DrawerFooter;

  return (
    <CurrentCredenzaFooter className={className} {...props}>
      {children}
    </CurrentCredenzaFooter>
  );
};

export {
  Credenza,
  CredenzaTrigger,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
}