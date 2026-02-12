import Image from "next/image";
import { services } from "@/data/services";

export function ServicesSection() {
  return (
    <section className="services">
      <div className="container">
        <div className="services__header">
          <p className="services__eyebrow">DOCKER SERVICES</p>
          <h2 className="services__title">Docker Services</h2>
          <p className="services__desc">
            emby, komga만 URL 접속가능. 나머지는 tailscale 환경
          </p>
        </div>
        <div className="services__grid">
          {services.map((service) => (
            <a
              key={service.name}
              className="service-card service-card--link"
              href={service.url}
              target="_blank"
              rel="noreferrer"
            >
              <div className="service-card__icon-wrap">
                <Image
                  src={service.icon}
                  alt={service.name}
                  width={24}
                  height={24}
                  className="service-card__icon"
                />
              </div>
              <p className="service-card__name">{service.name}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
