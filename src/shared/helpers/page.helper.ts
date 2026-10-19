import { stringToSlug, randomCharacters } from 'cms-lib-resources';
import { EntityManager } from 'cms-lib-database';
import { ReferenceRepository } from '@shared/repositories/reference.repository.js';
import { PageRepository } from '@modules/pages/repositories/page.repository.js';
import { LanguageRepository } from '@modules/languages/repositories/language.repository.js';
import { CreatePageDto } from '@modules/pages/dto/page.dto.js';
import { SitieRepository } from '@modules/sitie/repositories/sitie.repository.js';

export async function createPage(
  createPageDto: CreatePageDto,
  cnx: EntityManager,
) {
  const pageRepository = new PageRepository();
  const languageRepository = new LanguageRepository();
  const referenceRepository = new ReferenceRepository();
  const sitieRepository = new SitieRepository();

  const sitie = await sitieRepository.find();
  createPageDto.sitieId = sitie?.id;

  createPageDto.path = stringToSlug(createPageDto.path);
  const newPage = await pageRepository.create(createPageDto, cnx);

  const languages = await languageRepository.get({
    limit: 99999,
    page: 1,
    search: null,
    status: true,
  });

  const aliasRef: string = randomCharacters('COMBINED', 16);
  const descriptionRef: string = randomCharacters('COMBINED', 16);
  const seoKeywordsRef: string = randomCharacters('COMBINED', 16);

  for (let language of languages.records) {
    await referenceRepository.create(
      {
        ref: aliasRef,
        languageId: language.id!,
        text: '',
        pageId: newPage.id,
      },
      cnx,
    );
    await referenceRepository.create(
      {
        ref: descriptionRef,
        languageId: language.id!,
        text: '',
        pageId: newPage.id,
      },
      cnx,
    );
    await referenceRepository.create(
      {
        ref: seoKeywordsRef,
        languageId: language.id!,
        text: '',
        pageId: newPage.id,
      },
      cnx,
    );
  }

  await pageRepository.createDetails(
    {
      aliasRef,
      descriptionRef,
      seoKeywordsRef,
      pageId: newPage.id,
    },
    cnx,
  );

  return newPage;
}
